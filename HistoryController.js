var Hist
if(window.history.pushState)
	Hist = Hist || new HistController()

function HistController() {
	var _this = this
	this.url = window.location.pathname
	this.cache = {}
	this.requests = 0
	this.view = '#view'
	this.start = false
	this.init = function() {

	}
	this.get = function(e) {
		if(typeof e == 'object')
			e.preventDefault()
		_this.url = (typeof e == 'object') ? $(e.currentTarget).attr('href') : e
		_this.start = true
		if(_this.url in _this.cache) {
			_this.render(_this.cache[_this.url], false)
		} else {
			_this.requests++
			$.ajax({
				url: _this.url,
				type: 'GET',
				cache: false,
				success: function(data) {
					_this.render(data, true)
				},
				error: function(xhr, e, msg) {
					_this.render(xhr.responseText, true)
					if(!(/^4/.test(xhr.status)))
						$('#view').prepend($('<div id="flashMessage">An Error Occurred: ('+msg+')<br>'+xhr.responseText+'</div>'))
				},
				complete: function() {
					_this.requests--
				}
			})
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
		window.history.replaceState(JSON.stringify(data), document.title, data.url)
	},
	this.render = function(data, push) {
		if(_this.requests < 2) {
			var push = (typeof push === 'undefined') ? true : push
			try {
				data = JSON.parse(data)
			} catch(e) {
				data = {html:data, url: _this.url}
			}
			_this.saveState()
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
		}
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
