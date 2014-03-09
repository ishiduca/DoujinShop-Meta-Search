package DoujinShop::Meta::Toranoana;
use strict;
use utf8;
use Carp;

our $VERSION = '0.01';

use Moo;
use MooX::late;
use Encode qw(find_encoding);
use HTTP::Request::Common qw(POST);
use List::Util qw(reduce);
use Web::Scraper;

with qw(DoujinShop::Meta::Role);

has '+home' => (default => 'http://www.toranoana.jp');
has '+enc'  => (default => sub { find_encoding('cp932') });
has '+request_uri' => (
    default => sub { shift->home . '/cgi-bin/R2/d_search.cgi' },
);
has '+default_request_params' => (
    default => sub {
        +{
            item_kind => '0401',
            bl_flg    => '0',
            adl       => '0',
            obj       => '0',
            stk       => '1',
            img       => '1',
            ps        => '1',
        };
    },
);

sub parse_body {
    my($self, $body) = @_;

    my $scraper = scraper {
        process "table.addrtbl>tr>td>div>table.addrtbl", "tables[]" => scraper {
            process "img", "img" => '@src';
            process "a", "as_href[]" => '@href', "as_text[]" => 'TEXT';
        };
    };
    my $result = $scraper->scrape($body);

    [ map {
        $_ = +{
            title  => $_->{as_text}[2],
            circle => $_->{as_text}[3],
            urlOfTitle  => $self->home . $_->{as_href}[0],
            urlOfCircle => $self->home . substr($_->{as_href}[3], 1),
            srcOfThumbnail => $_->{img},
        }
    } @{$result->{tables}} ];
}

sub create_request_params {
    my $self   = shift;
    my %params = $self->_merge_request_params(@_);

    POST $self->request_uri => [
        reduce { $a->{$b} = $self->enc->encode($params{$b}); $a} +{}, keys %params
    ];
}

sub _merge_request_params {
    my $self   = shift;
    my %args   = @_;
    my %params = %{ $self->default_request_params };

    for my $key (keys %args) {
        $params{$key} = $args{$key};
    }

    %params;
}

1;
