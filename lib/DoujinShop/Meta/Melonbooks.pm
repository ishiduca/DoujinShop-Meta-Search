package DoujinShop::Meta::Melonbooks;
use strict;
use utf8;
use Carp;

our $VERSION = '0.20';

use Moo;
use MooX::late;
use Encode qw(find_encoding);
use HTTP::Request::Common qw(GET);
use List::Util qw(reduce);
use Web::Scraper;

with qw(DoujinShop::Meta::Role);

has '+home' => (default => 'https://www.melonbooks.co.jp');
has '+enc'  => (default => sub { find_encoding('utf8') });
has '+request_uri' => (
    default => sub { shift->home . '/search/search.php' },
);

has '+default_request_params' => (
    default => sub {
        +{
            mode => 'search',
            #search_disp => '',
            #chara => '',
            orderby     => 'date', # 並び替え順
            disp_number => 120, # 表示数
            pageno      => 1,
            text_type   => 'circle', # selected : 全て
                                     # title    : 作品タイトル
                                     # detail   : 作品詳細
                                     # circle   : circle
                                     # author   : 作家名
                                     # genre    : ジャンル名
                                     # chara    : キャラ名
                                     # event    : イベント名
            #name       => '',
            'is_end_of_sale%5B%5D' => 1, # 品切れ
            'is_end_of_sale2'      => 1,
            'category_ids%5B%5D'   => 1,
            genre                  => 0,
            co_name                => '',
            ci_name                => '', # 絞り込みサークル名
            sale_date_before       => '',
            sale_date_after        => '',
            price_row              => 0,
            price_high             => 0,
        };
    },
);

use URI::Escape;

sub parse_body {
    my($self, $body) = @_;
    my $home    = $self->home;
    my $scraper = scraper {
        process "#container>div>div>div>div>div>div>div>div.product>div.relative", "lis[]" => scraper {
            process "div.thumb>a", "urlOfTitle" => sub { $home . $_->attr('href'); };
            process "div.thumb>a", "title" => '@title';
            process "div.thumb>a>img", "srcOfThumbnail" => sub {
                my $src = $_->attr('src');
                $src =~ s/width=(?:\d+)?&height=(?:\d+)?/width=450&height=450/g;
                "${home}${src}";
            };
            process "div.group>div.title>p.circle", "circle" => 'TEXT';
            process "div.group>div.title>p.circle>a", "urlOfCircle" => sub {
                $home . $_->attr('href');
            };
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
