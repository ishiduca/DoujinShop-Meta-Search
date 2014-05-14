package DoujinShop::Meta::Melonbooks;
use strict;
use utf8;
use Carp;

our $VERSION = '0.02';
# 2014-05-14 結果ページにキャンペーンCMのDOMが挿入されたのでparse_bodyのxpathを変更

use Moo;
use MooX::late;
use Encode qw(find_encoding);
use AnyEvent::HTTP;
use HTTP::Request::Common qw(POST);
use List::Util qw(reduce);
use Web::Scraper;

with qw(DoujinShop::Meta::Role);

has '+home' => (default => 'http://shop.melonbooks.co.jp');
has '+enc'  => (default => sub { find_encoding('utf8') });
has '+request_uri'=> (default => sub { shift->home . '/shop/list' });
has '+default_request_params' => (
    default => sub {
        +{
            DA => 'de',
#            G  => '',  # アイテム
            E  => 'ON',      # 在庫切れを表示する
            P  => '30',      # 表示件数 6/10/15/30
            DS => 'desc',    # 表示形式: 画像あり: desc/画像なし: list
#            ID => '',        # 商品番号
#            M  => '',        # サークル/出版
#            MK => '',        # サークル/出版(読み)
#            T  => '',        # タイトル
#            TK => '',        # タイトル(読み)
#            AT => '',        # ジャンル/属性
#            AU => '',        # 作家名
#            CP => '',        # 登場キャラ
            'CR[]' => [qw(18 15 0)], # 年齢制限 # 18禁 R指定 一般
#            SQ => '',        # 在庫状況 # blue - 十分, yellow - 在庫少
#            EV => '',        # イベント
#            PYear  => '',    # 発行年 (発行日)
#            PMonth => '',    # 発行月 (発行日)
#            PDay   => '',    # 発行日 (発行日)
#            LYear  => '',    # 最終入荷年 (最終入荷日)
#            LMonth => '',    # 最終入荷月 (最終入荷日)
#            LDay   => '',    # 最終入荷日 (最終入荷日)
        }
    },
);

has is_logged_in => (
    is  => 'rw',
    isa => 'Bool',
    default => sub {0},
);


around 'request' => sub {
    my($org, $self, @args) = @_;

    if ($self->is_logged_in) {
        $org->($self, @args);
    } else {
        carp qq([DoujinShop::Meta::Melonbooks] try login) if $self->verbose;

        $self->login(sub {
            my($err, $hdrs) = @_;

            $self->is_logged_in
                ? $org->($self, @args)
                : carp qq($err)
            ;
        });
    }

    $self;
};

sub login {
    my $self = shift;
    my $cb; $cb = pop if ref $_[-1] eq 'CODE';

    my $jar  = $self->jar || +{version => 1};
    my $shop = $self->home . '/shop';

    my %params = (
        headers => {
            referer        => "$shop/check_age.php",
            'content-type' => 'application/x-www-form-urlencoded',
        },
        body       => 'RATED=18',
        cookie_jar => $jar,
    );

    my $guard;
    $guard = http_request POST => "$shop/index.php", %params, sub {
        undef $guard;

        my($body, $hdrs) = @_;
        my $err;

        if ($hdrs->{URL} eq "$shop/top/main") {
            $self->is_logged_in(1);
            $self->jar($jar);
        }

        else {
            $self->is_logged_in(0);
            $err = qq(login error: $hdrs->{Status}: $hdrs->{Reason});
        }

        $cb->($err, $hdrs) if ref $cb eq 'CODE';
    };

    $self;
}



sub parse_body {
    my($self, $body) = @_;
    my $home = $self->home;
    my $scraper = scraper {
        #process '/html/body/table/tbody/tr[3]/td[2]/table/tbody/tr[2]/td/div/table/tr', 'trs[]' => scraper {
        process '/html/body/table/tbody/tr[4]/td[2]/table/tbody/tr[2]/td/div/table/tr', 'trs[]' => scraper {
            process '//td[2]/table/tr[2]/td/font/a', 'circle' => 'TEXT';
            process '//td[2]/table/tr[2]/td/font/a', 'urlOfCircle' => sub {
                my $el = shift;
                $home . $el->attr('href');
            };
            process '//td[2]/table/tr/td/font',   'title' => 'TEXT';
            process '//td/table/tr[4]/td/form/a', 'urlOfTitle' => sub {
                my $el = shift;
                $home . $el->attr('href');
            };
            process '//td/table/tr[2]/td/div/a', 'srcOfThumbnail' => '@href';
        };
    };

    [ grep { exists $_->{title} } @{$scraper->scrape( $body )->{trs}} ];
}

sub create_request_params {
    my $self = shift;
    my %args = @_;
    my %defs = %{ $self->default_request_params };

    for my $key (keys %args) {
        $defs{$key} = $self->enc()->encode($args{$key});
    }

    POST $self->request_uri, [ %defs ];
}

1;
