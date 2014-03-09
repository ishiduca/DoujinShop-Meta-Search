package DoujinShop::Meta::Role;
use strict;
use Moo::Role;
use MooX::late;

requires qw(request parse_body create_request_params);

has home => (
    is  => 'ro',
    isa => 'Str',
);

has enc => (
    is  => 'ro',
    isa => sub {
        my $self = shift;
        $self->isa('Encode') || $self->isa('Encode::XS');
    },
);

has jar => (
    is  => 'rw',
    isa => 'HashRef',
    default => sub { +{version => 1} }
);

has verbose => (
    is  => 'ro',
    isa => 'Bool',
    default => 0,
);

has default_request_params => (
    is  => 'ro',
    isa => 'HashRef',
);

has request_uri => (
    is  => 'ro',
    isa => 'Str',
);

use Carp qw(croak);
use AnyEvent::HTTP;

sub request {
    ref $_[-1] ne 'CODE' and croak qq("callback" not found);

    my $self = shift;
    my $cb   = pop;
    my $req  = $self->create_request_params(@_);
    my $jar  = $self->jar;

    my %params = (
        headers    => $req->headers,
        cookie_jar => $jar,
    );

    $req->content and $params{body} = $req->content;

    my $guard; $guard = http_request $req->method => $req->uri, %params,
        sub {
            my($body, $hdr) = @_;

            undef $guard;

            if ($hdr->{Status} !~ /^2/) {
                $cb->(qq($hdr->{Status}: $hdr->{URL}), undef, $hdr);
                return 0;
            }

            $self->jar( $jar );
            $cb->(undef, $self->parse_body($self->enc->decode($body)), $hdr);
        }
    ;
}

1;
