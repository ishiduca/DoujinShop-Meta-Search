package MainHandler;
use parent qw(Tatsumaki::Handler);
use YAML qw(LoadFile);
use FindBin;

sub get {
    shift->render('index.html' => LoadFile("$FindBin::Bin/config/app.yml"));
}

package main;
use DoujinShop::Meta::Search;
use DoujinShop::Meta::Search::Hippie;
use File::Basename qw(dirname);
use File::Spec;
use Plack::Builder;
#use AnyMQ;

my $app = Tatsumaki::Application->new([
    '/' => 'MainHandler',
    '/service/(tora|zin|melon)/(\w+)/(.+)' => 'DoujinShop::Meta::Search',
]);
$app->static_path(  File::Spec->catdir(dirname(__FILE__), 'public'));
$app->template_path(File::Spec->catdir(dirname(__FILE__), 'views'));

$app = builder {
    enable 'Cache::Memcached::Fast', config => {
        servers => [qw(localhost:11211)]
    };
    mount '/_hippie' => builder {
       enable "+Web::Hippie";
#       enable "+Web::Hippie::Pipe", bus => AnyMQ->new;
       DoujinShop::Meta::Search::Hippie->new;
    };
    mount '/' => $app;
};

# run
# twiggy -Ilib -p 5000
