function Hist() {
	this.url = window.location.href
	this.cache = {}
	this.view = '#view'
	this.start = false
	this.init = function() {}
	$(function() {
		Hist.init()
		if(window.location.hash) {
			Hist.get(window.location.hash.replace('#!', ''))
		}

		$(document).on('click', 'a[href^="/"]', Hist.get)
		$(window).on('popstate', Hist.changeState)
	})
}

Hist.prototype.get = function(e) {
	Hist.url = (e.target) ? $(e.target).attr('href') : e
	Hist.start = true
	if(Hist.url in Hist.cache) {
		Hist.render(Hist.cache[Hist.url], false)
	} else {
		$.ajax({
			url: Hist.url,
			type: 'GET',
			cache: false,
			success: Hist.render,
			error: function(e, xhr, msg) {
				console.log(e, xhr, msg)
			}
		})
	}
	return false
}

Hist.prototype.changeState = function() {
	console.log('pop')
	if(!history.state || !Hist.start) {
		Hist.saveState()
	} else {
		Hist.render(history.state, false)
	}
}

Hist.prototype.saveState = function() {
	data = {html:$(Hist.view).html(),url:window.location.href}
	window.history.replaceState(JSON.stringify(data), null, data.url)
}

Hist.prototype.render = function(data, push) {
	var push = (typeof push === 'undefined') ? false : push
	try {
		data = JSON.parse(data)
	} catch(e) {
		data = {html:data, url: Hist.url}
	}
	$(Hist.view).fadeOut(50, function() {$(this).html(data.html).fadeIn(50); Hist.init()})
	if(history.pushState) {
		if(push) {
			Hist._cache(data.url, data.html)
			history.pushState(JSON.stringify(data), null, data.url)
		} else {
			history.replaceState(JSON.stringify(data), null, data.url)
		}
	} else if (push) {
		window.location.hash = '!'+data.url.substring(data.url.indexOf('#'), -1).replace(window.location.origin, '')
	}
}

Hist.prototype._cache = function(url, data) {
	if(!(url in this.cache)) {
		this.cache[url] = JSON.stringify({html:data,url:url})
		setTimeout(function() {
			console.log('cache delete '+url)
			delete Hist.cache[url]
		}, 10000)
	}
}

var Hist = new Hist()