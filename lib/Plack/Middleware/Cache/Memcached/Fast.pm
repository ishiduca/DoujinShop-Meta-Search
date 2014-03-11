package Plack::Middleware::Cache::Memcached::Fast;
use strict;
use warnings;
use Carp qw(croak);
use parent qw(Plack::Middleware);
use Cache::Memcached::Fast;

use Plack::Util::Accessor qw(config client);

sub prepare_app {
    my $self   = shift;
    my $client = $self->client;

    if (! defined $client || ! $client->isa('Cache::Memcached::Fast')) {
        croak qq("config" not found) unless $self->config;
        $self->client(Cache::Memcached::Fast->new($self->config));
    }
}

sub call {
    my($self, $env) = @_;
    $env->{'psgix.memd'} = $self->client;
    $self->app->($env);
}

1;
