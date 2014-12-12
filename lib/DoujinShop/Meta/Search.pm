package DoujinShop::Meta::Search;
use strict;
use utf8;
use Carp ();

our $VERSION = '0.10';

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
    melon => sub { shift =~ /^(circle|title|author|chara)$/ },
);
my %adapts = (
    zin   => sub { 'name' },
    tora  => sub { shift },
    melon => sub {
        my $key = shift;
		$key =~ s/ mak /circle/x;
		$key =~ s/ nam /title/x;
		$key =~ s/ act /author/x;
		$key =~ s/ mch /chara/x;

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

    @ps;
}

sub get {
    my($self, $service, $key, $val) = @_;

    $key = $adapts{$service}->($key);

    if (! $validates{$service}->($key)) {
        Carp::carp qq(ParameterNameError: "$key" can not use on "$service");
        Tatsumaki::Error::HTTP->throw(400);
    }

#    my @params = create_params( $service, $key, $val);
    my @params = $service eq 'melon'
	           ? create_params( $service, 'text_type' => $key, 'name' => $val )
			   : create_params( $service, $key, $val );

    my $env   = $self->request->env;
    my $memd  = $env->{'psgix.memd'};
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
