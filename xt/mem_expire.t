use strict;
use utf8;
use Test::More;
use Cache::Memcached::Fast;

BEGIN {
	binmode STDOUT => ':utf8';
	binmode STDERR => ':utf8';
}

my $client = Cache::Memcached::Fast->new({
	servers => [qw/localhost:11211/],
});

subtest 'setメソッドの $expiration_timeの有効性を確認' => sub {
	$client->set('foo', 'bar', 1);

	is $client->get('foo'), 'bar', 'set直後は値を返す';
    sleep 1;
	is $client->get('foo'), undef, '$expiration_time以降は値を返さない';
};


done_testing;
