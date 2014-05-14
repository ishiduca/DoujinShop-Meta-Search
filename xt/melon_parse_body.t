use strict;
use warnings;
use utf8;
use FindBin;
use File::Spec;
use File::Slurp qw(read_file);
use DoujinShop::Meta::Melonbooks;
use Web::Scraper;
use Data::Dumper;

no warnings 'redefine';
local *DoujinShop::Meta::Melonbooks::parse_body = sub {
    my($self, $body) = @_;
    my $home = $self->home;

    my $scraper = scraper {
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
};

my $path = File::Spec->catfile($FindBin::Bin, 'data', 'melon_mtsp.html');
my $html = read_file $path;
my $client = DoujinShop::Meta::Melonbooks->new;

my $result = $client->parse_body($client->enc->decode( $html ));
print Dumper $result;
