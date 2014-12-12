package DoujinShop::Meta::Controller::Dashboard;
use Moo;
use MooX::late;
extends qw(Tatsumaki::Handler);

sub get {
    shift->render('index.html');
}

1;
