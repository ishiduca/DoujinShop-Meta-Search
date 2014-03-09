;(function (global) {

var q = setup()
var d = document

q.module('star test')
q.test('初期状態: stars === 2', function (t) {
	t.ok(d.getElementById('stars'),'exists #stars')
	var stars = d.getElementById('stars').getElementsByClassName('star')

	t.is(stars.length, 5, '.stars length "5"')

	function subtest (i, result, mes) {
		t.is(stars[i].className.replace(/\s+/g, ' '), result, mes)
	}

	subtest(0, 'star is-stared', '.stars[0] className "star is-stared"')
	subtest(1, 'star is-stared', '.stars[1] className "star is-stared"')
	subtest(2, 'star ', '.stars[2] className "star"')
	subtest(3, 'star ', '.stars[3] className "star"')
	subtest(4, 'star ', '.stars[4] className "star"')
})

q.test('5つめをクリック: stars === 5', function (t) {
	var stars = d.getElementById('stars').getElementsByClassName('star')

	function subtest (i, result, mes) {
		t.is(stars[i].className.replace(/\s+/g, ' '), result, mes)
	}

    stars[4].click()

	subtest(0, 'star is-stared', '.stars[0] className "star is-stared"')
	subtest(1, 'star is-stared', '.stars[1] className "star is-stared"')
	subtest(2, 'star is-stared', '.stars[2] className "star is-stared"')
	subtest(3, 'star is-stared', '.stars[3] className "star is-stared"')
	subtest(4, 'star is-stared', '.stars[4] className "star is-stared"')
})

q.test('[x]をクリック: stars === 0', function (t) {
	var stars = d.getElementById('stars').getElementsByClassName('star')

	function subtest (i, result, mes) {
		t.is(stars[i].className.replace(/\s+/g, ' '), result, mes)
	}

    var rm = d.getElementById('stars').getElementsByClassName('rmStar')[0]
	t.ok(rm, 'exists ".rmStar"')

    rm.click()

	subtest(0, 'star ', '.stars[0] className "star "')
	subtest(1, 'star ', '.stars[1] className "star "')
	subtest(2, 'star ', '.stars[2] className "star "')
	subtest(3, 'star ', '.stars[3] className "star "')
	subtest(4, 'star ', '.stars[4] className "star "')
})

function setup () {
    var t = global.QUnit.assert
    t.is = t.strictEqual
    t.like = function (str, reg, mes) { this.ok(reg.test(str), mes) }

	qunitTap(global.QUnit, function (mes) { console.log(mes) })

	return global.QUnit;
}

})(this.self)
