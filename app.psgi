package MainHandler;
use parent qw(Tatsumaki::Handler);
sub get { shift->render('index.html') }

package main;
use DoujinShop::Meta::Search;
use File::Basename qw(dirname);
use File::Spec;
use Plack::Builder;

my $app = Tatsumaki::Application->new([
    '/' => 'MainHandler',
    '/service/(tora|zin|melon)/(\w+)/(.+)' => 'DoujinShop::Meta::Search',
]);
$app->static_path(  File::Spec->catdir(dirname(__FILE__), 'public'));
$app->template_path(File::Spec->catdir(dirname(__FILE__), 'views'));


builder {
    enable "Cache::Memcached::Fast", config => { servers => [qw(localhost:11211)], };
    $app;
};

# run
# twiggy -Ilib -p 5000
