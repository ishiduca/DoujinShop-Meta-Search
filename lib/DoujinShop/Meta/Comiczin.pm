package DoujinShop::Meta::Comiczin;
use strict;
use utf8;
use Carp;

our $VERSION = '0.01';

use Moo;
use MooX::late;
use Encode qw(find_encoding);
use HTTP::Request::Common qw(GET);
use List::Util qw(reduce);
use Web::Scraper;

with qw(DoujinShop::Meta::Role);

has '+home' => (default => 'http://shop.comiczin.jp');
has '+enc'  => (default => sub { find_encoding('utf8') });
has '+request_uri' => (
    default => sub { shift->home . '/products/list.php' },
);
has '+default_request_params' => (
    default => sub {
        +{ mode => 'search' };
    },
);

use URI::Escape;

sub parse_body {
    my($self, $body) = @_;
    my $home    = $self->home;
    my $scraper = scraper {
        process "#form1>ul>li", "lis[]" => scraper {
            process "div>div>a" => "urlOfTitle" => sub {
                $home . $_->attr('href');
            };
            process "div>div>a>img" => "srcOfThumbnail" => sub {
                $home . $_->attr('src');
            };
            process "div>div>a>img" => "title" => '@alt';
            process "div>div>p" => 'circle' => [ 'TEXT' => sub {
                (split /\s/, $_)[1];
            }];
        };
    };

    $scraper->scrape($body)->{lis} || [];
}


sub create_request_params {
    my $self   = shift;
    my %params = $self->_merge_request_params(@_);
    my $query  = join '&', map {
        $_ = "$_=" . uri_escape_utf8($params{$_});
    } keys %params;

    GET join '?', $self->request_uri, $query;
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
