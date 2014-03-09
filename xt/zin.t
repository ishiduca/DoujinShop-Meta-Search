use strict;
use warnings;
use utf8;
use Test::More;
use Test::Mock::Guard qw(mock_guard);
use DoujinShop::Meta::Comiczin;

use File::Basename qw(dirname);
use File::Slurp qw(slurp);
use File::Spec;

BEGIN {
    binmode STDOUT => ':utf8';
    binmode STDERR => ':utf8';
}

subtest 'use DoujinShop::Meta::Comiczin' => sub {
    my $client = DoujinShop::Meta::Comiczin->new;
    ok $client;
};

subtest '->new でデフォルトのアトリビュートが有効になっているか' => sub {
    my $client = DoujinShop::Meta::Comiczin->new;
    is $client->request_uri, 'http://shop.comiczin.jp/products/list.php';
    is_deeply $client->jar, +{version => 1};
};

subtest '->_merge_request_params(@_)' => sub {
    my $client = DoujinShop::Meta::Comiczin->new;
    my %params = $client->_merge_request_params(name => 'foo');
    is_deeply \%params, +{
        name => 'foo',
        mode => 'search',
    };
};

subtest '->create_request_params(@_)' => sub {
    my $guard  = mock_guard('Encode', +{ encode => sub {@_} });

    my $client = DoujinShop::Meta::Comiczin->new;
    my $req = $client->create_request_params(name => 'foo');

    ok $req;
    ok $req->headers;
    like $req->uri, qr{http://shop\.comiczin\.jp/products/list\.php\?(name=foo&mode=search|mode=search&name=foo)};
};

subtest '->parse_body($body)' => sub {
    my $html = slurp(File::Spec->catfile(
                   dirname(__FILE__), 'data/shinkai.html'));

    my $client = DoujinShop::Meta::Comiczin->new;
    my $result = $client->parse_body( $client->enc->decode($html));

    ok $result;
    is scalar @{$result}, 7;

    my $subtest = sub {
        local $_ = shift;
        my %res = @_;
        is $_->{title}, $res{title};
        is $_->{circle}, $res{circle};
        is $_->{urlOfCircle}, $res{urlOfCircle};
        is $_->{urlOfTitle},  $res{urlOfTitle};
        is $_->{srcOfThumbnail}, $res{srcOfThumbnail};
    };

    $subtest->($result->[0],
        title => 'KONAKARA',
        circle => '流星',
        urlOfCircle => undef,
        urlOfTitle => 'http://shop.comiczin.jp/products/detail.php?product_id=18888',
        srcOfThumbnail => 'http://shop.comiczin.jp/upload/save_image/_18000/_m/18888_s.jpg',
    );

    $subtest->($result->[-1],
        title => 'MARU',
        circle => '流星機関',
        urlOfCircle => undef,
        urlOfTitle => 'http://shop.comiczin.jp/products/detail.php?product_id=5963',
        srcOfThumbnail => 'http://shop.comiczin.jp/upload/save_image/_5000/_m/5963_s.jpg',
    );
};

use Test::TCP;
use Test::Requires qw(Plack::Loader Plack::App::Directory);
use AnyEvent;

subtest 'fake server' => sub {
    test_tcp(
        client => \&client_test,
        server => \&server_run,
    );
};

sub client_test {
    my($port, undef) = @_;
    my $guard = mock_guard('DoujinShop::Meta::Comiczin', +{
        request_uri => sub { "http://127.0.0.1:${port}/shinkai.html" },
    });
    my $cv = AE::cv;
    my $client = DoujinShop::Meta::Comiczin->new;

    $client->request( mak => '井上眞改', sub {
        my($err, $result, $hdr) = @_;

        ok ! $err, '1st argument $err eq undefined';
        is $hdr->{Status}, 200;

        ok $result;
        is $result->[0]->{circle}, '流星';
        is $result->[0]->{title}, 'KONAKARA';
        is $result->[-1]->{title}, 'MARU';

        $cv->send;
    });


    $cv->recv;
}

sub server_run {
    my $port = shift;
    my $app = Plack::App::Directory->new({
        root => File::Spec->catdir(dirname(__FILE__), 'data'),
    })->to_app;

    Plack::Loader->auto(host => '127.0.0.1', port => $port)->run($app);
}

done_testing;
