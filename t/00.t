use strict;
use Test::More;

use_ok $_ for qw(
    DoujinShop::Meta::Role
    DoujinShop::Meta::Toranoana
    DoujinShop::Meta::Comiczin
    DoujinShop::Meta::Melonbooks
    Plack::Middleware::Cache::Memcached::Fast
);

done_testing;
