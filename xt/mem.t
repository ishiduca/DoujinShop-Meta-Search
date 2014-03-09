use strict;
use warnings;
use utf8;
use Test::More;
use Plack::Test;
use HTTP::Request::Common;
use Plack::Middleware::Cache::Memcached::Fast;
use Data::Dumper;

BEGIN {
	binmode STDOUT => ':utf8';
	binmode STDERR => ':utf8';
}

local $Data::Dumper::Terse = 1;
local $Data::Dumper::Purity = 1;

my $app = sub {
	my $env = shift;
    my $memd = $env->{'psigx.memd'};

    $memd->set('foo', 'bar', 1);

	[200, ['Content-type', 'text/plain'], [ $memd->get('foo') ] ];
};

$app = Plack::Middleware::Cache::Memcached::Fast->wrap($app, config => {servers => [qw(localhost:11211)]});

test_psgi $app, sub {
	my $cb = shift;
	my $res = $cb->(GET "/");
    is $res->content, 'bar';

	done_testing;
};

