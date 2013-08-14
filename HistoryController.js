var Hist
if(window.history.pushState)
	Hist = Hist || new HistController()

function HistController() {
	var _this = this
	this.url = window.location.pathname
	this.cache = {}
	this.view = '#view'
	this.start = false
	this.init = function() {
		$('.overlay, .cat').addClass('anim')
	}
	this.get = function(e) {
		if(typeof e == 'object')
			e.preventDefault()
		if(typeof e === 'string' || !e.isPropagationStopped()) {
			_this.url = (typeof e == 'object') ? $(e.currentTarget).attr('href') : e
			_this.start = true
			if(_this.url in _this.cache) {
				_this.render(_this.cache[_this.url], false)
			} else {
				$.ajax({
					url: _this.url,
					type: 'GET',
					cache: false,
					success: function(data) {
						_this.render(data, true)
					},
					error: function(xhr, e, msg) {
						$('#view').prepend($('<div id="flashMessage">An Error Occurred: ('+msg+')<br>'+xhr.responseText+'</div>'))
					}
				})
			}
		}
	},
	this.changeState = function() {
		if(!history.state || !_this.start) {
			_this.saveState()
		} else {
			_this.render(history.state, false)
		}
	},
	this.saveState = function() {
		data = {html:$(_this.view).html(),url:window.location.pathname}
		window.history.replaceState(JSON.stringify(data), null, data.url)
	},
	this.render = function(data, push) {
		var push = (typeof push === 'undefined') ? true : push
		try {
			data = JSON.parse(data)
		} catch(e) {
			data = {html:data, url: _this.url}
		}
		if(window.history.pushState) {
			if(push) {
				_this._cache(data.url, data.html)
				window.history.pushState(JSON.stringify(data), null, data.url)
			} else {
				window.history.replaceState(JSON.stringify(data), null, data.url)
			}
		} else if (push) {
			// window.location.hash = '!'+data.url.substring(data.url.indexOf('#'), -1)
		}
		$(_this.view).html(data.html)
		_this.init()
	},
	this._cache = function(url, data) {
		if(!(url in _this.cache)) {
			_this.cache[url] = JSON.stringify({html:data,url:url})
			setTimeout(function() {
				delete _this.cache[url]
			}, 10000)
		}
	}
	if(window.location.hash) {
		this.get(window.location.hash.replace('#!', ''))
	}
	$(document).on('click', 'a[href^="/"]:not(.hard)', this.get)
	$(window).on('popstate', this.changeState)
}