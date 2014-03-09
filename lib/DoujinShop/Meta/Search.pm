package DoujinShop::Meta::Search;
use strict;
use utf8;
use Carp ();

our $VERSION = '0.02';

use parent qw(Tatsumaki::Handler);
__PACKAGE__->asynchronous(1);

use Tatsumaki::Application;
use Tatsumaki::Error;
use DoujinShop::Meta::Toranoana;
use DoujinShop::Meta::Melonbooks;
use DoujinShop::Meta::Comiczin;
use Encode qw(find_encoding);

my $enc = find_encoding('utf8');
my %clients = (
    zin   => DoujinShop::Meta::Comiczin->new,
    melon => DoujinShop::Meta::Melonbooks->new,
    tora  => DoujinShop::Meta::Toranoana->new,
);
my %validates = (
    zin   => sub { shift eq 'name' },
    tora  => sub { shift =~ /^(mak|nam|act|mch)$/ },
    melon => sub { shift =~ /^(M|T|AU|CP)$/ },
);
my %adapts = (
    zin   => sub { 'name' },
    tora  => sub { shift },
    melon => sub {
        my $key = shift;
        $key =~ s/ mak /M/x;
        $key =~ s/ nam /T/x;
        $key =~ s/ act /AU/x;
        $key =~ s/ mch /CP/x;

        $key;
    },
);
my $expiration_time = 1 * 60 * 60; # 1hour;

sub create_params {
    my $service = shift;
    my %params  = @_;
    my @ps      = ();

    for my $key (sort {"\L$a" cmp "\L$b"} keys %params) {
        push @ps, $key => $enc->decode($params{$key});
    }

     $service eq 'melon' and push @ps, G => '同人誌';
     @ps;
}

sub get {
    my($self, $service, $key, $val) = @_;

    $key = $adapts{$service}->($key);

    if (! $validates{$service}->($key)) {
        Carp::carp qq(ParameterNameError: "$key" can not use on "$service");
        Tatsumaki::Error::HTTP->throw(400);
    }

    my @params = create_params( $service, $key, $val);

    my $env   = $self->request->env;
    my $memd  = $env->{'psigx.memd'};
    my $id    = join '=', @params;
    my $result = $memd->get($id);

    if ($result) {
        Carp::carp qq([Cache::Memcached::Fast] "$service" send response);
        $self->finish($result);
        return 1;
    }

    $clients{$service}->request(@params => $self->async_cb(sub {
        $self->on_response($service, \@params, @_, sub {
            #$memd->set($id, $_[0], $expiration_time);
            $memd->set($id, +{
                service  => $service,
                request  => \@params,
                response => $_[0]
            }, $expiration_time);
            Carp::carp qq([Cache::Memcached::Fast] set result - "$id");
        });
    }));
}

sub on_response {
    my($self, $service, $params, $err, $result, $hdr, $cb) = @_;

    if ($err) {
        Carp::carp $err;
        Tatsumaki::Error::HTTP->throw(500);
    }

    if ($hdr->{URL} =~ m! \/check_age\.php$ !x) {
        Carp::carp('[DoujinShop::Meta::Melonbooks] session timeout.'
          . qq(now "$hdr->{URL}" retry login));
        $clients{melon} = DoujinShop::Meta::Melonbooks->new;

        $clients{melon}->request(@{$params}, $self->async_cb(sub {
            Carp::carp qq(DoujinShop::Meta::Melonbooks] get response on Re request);
            $self->on_response($service, $params, @_, $cb);
        }));
        return ;
    }

    Carp::carp qq([DoujinShop::Meta::*] "$service" send response);
    #$self->finish($result);
    $self->finish({
        service  => $service,
        request  => $params,
        response => $result,
    });

    $cb->($result);
}

1;
