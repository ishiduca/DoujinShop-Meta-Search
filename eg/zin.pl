#!/usr/bin/env perl
use strict;
use warnings;
use utf8;
use DoujinShop::Meta::Comiczin;
use Encode qw(find_encoding);
use AE;

$ARGV[1] or die qq(usage: $0 mak foo);

my $enc = find_encoding('utf8');

my %args = @ARGV;
for my $key (keys %args) {
    $args{$key} = $enc->decode($args{$key});
}

my $client = DoujinShop::Meta::Comiczin->new;
my $cv = AE::cv;

$client->request(%args, sub {
    my($err, $res, $hdr) = @_;

    if ($err) {
        warn "$err\n";
        $cv->croak;
        return;
    }

    for my $r (@{$res}) {
        print $enc->encode("$r->{title} | $r->{circle}\n");
    }

    $cv->send;
});

$cv->recv;
