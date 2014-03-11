package DoujinShop::Meta::Search::Hippie;
use strict;
use Carp qw(carp);
use utf8;
use Encode qw(find_encoding);
use DoujinShop::Meta::Toranoana;
use DoujinShop::Meta::Melonbooks;
use DoujinShop::Meta::Comiczin;

use overload q(&{}) => sub { shift->psgi_app }, fallback => 1;

our $VERSION = '0.01';

sub new {
    my $class = shift;
    my %args  = @_;

    my %clients = (
        tora  => DoujinShop::Meta::Toranoana->new(verbose => 1),
        melon => DoujinShop::Meta::Melonbooks->new(verbose => 1),
        zin   => DoujinShop::Meta::Comiczin->new(verbose => 1),
    );

    my %adaptors = (
        tora => sub { @_ },
        melon => sub {
            my %args = @_;
            $args{G} = '同人誌';
            $args{mak} and $args{M}  = delete $args{mak};
            $args{nam} and $args{T}  = delete $args{nam};
            $args{act} and $args{AU} = delete $args{act};
            $args{mch} and $args{CP} = delete $args{mch};
            %args;
        },
        zin => sub { my %args = (name => $_[1]) },
    );

    bless {
        clients  => \%clients,
        adaptors => \%adaptors,
        expiration_time => $args{expiration_time} || 60 * 60 * 1, # 1hour
    }, $class;
}

my $enc = find_encoding('utf8');

sub create_memcached_key {
    my $self = shift;
    my %qs   = @_;
    my @args = ();

    for my $key (sort{"\L$a" cmp "\L$b"} keys %qs) {
        push @args, "${key}=" . $enc->encode($qs{$key});
    }

    join '&', @args;
}

sub psgi_app {
    my $self = shift;

    sub {
        my $env = shift;
        my $handle = $env->{'hippie.handle'};
        my $msg    = $env->{'hippie.message'};
        my $memd   = $env->{'psgix.memd'};

        if ($env->{PATH_INFO} eq '/message') {
            carp qq([Web::Hippie] PATH_INFO  "/message");

            for my $service (keys %{$self->{clients}}) {
                my $client = $self->{clients}->{$service};
                my %qs     = $self->{adaptors}->{$service}->(%{$msg});
                my $index  = $self->create_memcached_key( %qs );

                carp qq([Cache::Memcached::Fast] request -> "$service");

                if (my $results = $memd->get($index)) {
                    $handle->send_msg({
                        error    => 0,
                        service  => $service,
                        response => $results,
                        request  => $msg,
                    });
                    carp qq([Cache::Memcached::Fast] have results and send it);
                }

                else {
                    $self->request($handle, $msg, $service, $index, %qs, sub {
                        my $results = shift;
                        $memd->set($index, $results, $self->{expiration_time});
                        carp qq([Cache::Memcached::Fast] save "$index");
                    });
                }
            }
        }
    };
}

sub request {
    my $cb = pop;
    my($self, $handle, $msg, $service, $index, %qs) = @_;

    carp qq([DoujinShop::Meta::*] "$service" request "$index");
    $self->{clients}->{$service}->request(%qs => sub {
        my($err, $results, $hdr) = @_;

        carp qq([DoujinShop::Meta::*] "$service" get response);

        if ($err) {
            $handle->send_msg({
                error    => $err,
                service  => $service,
                response => undef,
                request  => $msg,
            });
            return carp qq(! [DoujinShop::Meta::*] "$service" ERROR: "$err");
        }

        if ($hdr->{URL} =~ m! /check_age\.php$ !x) {
            my $client = $self->{clients}{$service}
                       = DoujinShop::Meta::Melonbooks->new(verbose => 1);

            $self->request($handle, $msg, $service, $index, %qs, $cb);
            return qq([DoujinShop::Meta::*] "$service" request "$index" retry);
        }

        $handle->send_msg({
            error    => 0,
            service  => $service,
            response => $results,
            request  => $msg,
        });

        $cb->($results);

    });
}

1;
