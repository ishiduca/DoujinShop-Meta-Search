use strict;
use warnings;
use utf8;
use Test::More;
use Test::Mock::Guard qw(mock_guard);
use DoujinShop::Meta::Toranoana;

use File::Basename qw(dirname);
use File::Slurp qw(slurp);
use File::Spec;

BEGIN {
    binmode STDOUT => ':utf8';
    binmode STDERR => ':utf8';
}

subtest 'use DoujinShop::Meta::Toranoana' => sub {
    my $client = DoujinShop::Meta::Toranoana->new;
    ok $client;
};

subtest '->new でデフォルトのアトリビュートが有効になっているか' => sub {
    my $client = DoujinShop::Meta::Toranoana->new;
    is $client->home, 'http://www.toranoana.jp';
    is $client->request_uri, 'http://www.toranoana.jp/cgi-bin/R2/d_search.cgi';
    is_deeply $client->jar, +{version => 1};
};

subtest '->_merge_request_params(@_)' => sub {
    my $client = DoujinShop::Meta::Toranoana->new;
    my %params = $client->_merge_request_params(mak => 'foo');
    is_deeply \%params, +{
        item_kind => '0401',
        bl_flg    => '0',
        adl       => '0',
        obj       => '0',
        stk       => '1',
        img       => '1',
        ps        => '1',
        mak       => 'foo'
    };
};

subtest '->create_request_params(@_)' => sub {
    my $guard  = mock_guard('Encode', +{ encode => sub {@_} });

    my $client = DoujinShop::Meta::Toranoana->new;
    my $req = $client->create_request_params(mak => 'foo');

    ok $req;
    ok $req->headers;
    is $req->uri, 'http://www.toranoana.jp/cgi-bin/R2/d_search.cgi';
    like $req->content, qr/mak=foo/;
    like $req->content, qr/item_kind=0401/;
};

subtest '->parse_body($body)' => sub {
    my $html = slurp(File::Spec->catfile(
                   dirname(__FILE__), 'data/xration.html'));

    my $client = DoujinShop::Meta::Toranoana->new;
    my $result = $client->parse_body( $client->enc->decode($html));

    ok $result;
    is scalar @{$result}, 22;

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
        title => '参上!鬼ヶ島',
        circle => 'Xration',
        urlOfCircle => 'http://www.toranoana.jp/cgi-bin/R2/d_search.cgi?bl_fg=0&item_kind=0401&mak=Xration&img=1&stk=1&makAg=1&p1=18&p2=96&p3=5730303639363138',
        urlOfTitle => 'http://www.toranoana.jp/mailorder/article/04/0030/17/64/040030176416.html',
        srcOfThumbnail => 'http://img.toranoana.jp/img18/04/0030/17/64/040030176416-1r.gif',
    );

    $subtest->($result->[-1],
        title => '諌め姫',
        circle => 'Xration',
        urlOfCircle => 'http://www.toranoana.jp/cgi-bin/R2/d_search.cgi?bl_fg=0&item_kind=0401&mak=Xration&img=1&stk=1&makAg=1&p1=18&p2=96&p3=5730303639363138',
        urlOfTitle => 'http://www.toranoana.jp/mailorder/article/04/0000/03/98/040000039833.html',
        srcOfThumbnail => 'http://img.toranoana.jp/img18/04/0000/03/98/040000039833-1r.gif',
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
    my $guard = mock_guard('DoujinShop::Meta::Toranoana', +{
        request_uri => sub { "http://127.0.0.1:${port}/xration.html" },
    });
    my $cv = AE::cv;
    my $client = DoujinShop::Meta::Toranoana->new;

    $client->request( mak => 'Xration', sub {
        my($err, $result, $hdr) = @_;

        ok ! $err, '1st argument $err eq undefined';
        is $hdr->{Status}, 200;

        ok $result;
        is $result->[0]->{circle}, 'Xration';
        is $result->[0]->{title}, '参上!鬼ヶ島';
        is $result->[-1]->{title}, '諌め姫';

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
