/*
	 ___ ___    _   ___ __  __ ___ _  _ _____  
	| __| _ \  /_\ / __|  \/  | __| \| |_   _|  
	| _||   / / _ \ (_ | |\/| | _|| .` | | |    
	|_| |_|_\/_/ \_\___|_|  |_|___|_|\_| |_|    
					   FRAGMENTLABS.COM

	History Controller
	------
	A javascript class for enabling ajax navigation with a central 'view',
	configurable caching, and overrides.
	Uses HTML5 History API features such as pushState and replaceState.

*/
var Hist
if(window.history.pushState)
	Hist = Hist || new HistController()

function HistController() {
	var _this = this
	this.url = window.location.pathname
	this.cache = {}
	this.cacheTimeout = 10000
	this.useAjaxCaching = true
	this.requests = 0
	this.view = '#view'
	this.enable = 'a[href^="/"].ajax'
	this.start = false
	this.init = function() {
		
	}
	this.get = function(e) {
		if(typeof e === 'object')
			if(!e.metaKey)
				e.preventDefault()
			else
				return true
		_this.url = (typeof e == 'object' && e.currentTarget) ? $(e.currentTarget).attr('href') : e
		_this.start = true
		if(_this.url in _this.cache) {
			_this.render(_this.cache[_this.url], _this.url, true)
		} else {
			_this.requests++
			$.ajax({
				url: _this.url,
				type: 'GET',
				dataType: 'html',
				headers: {
					Accept: 'text/html'
				},
				cache: _this.useAjaxCaching,
				complete: function(xhr) {
					_this.requests--
					_this.render(xhr.responseText, _this.url, true)
					if(/^4|^5/.test(xhr.status))
						$('#view').prepend($('<div id="flashMessage">An Error Occurred: ('+xhr.statusText+')<br></div>'))
				}
			})
		}
	},
	this.changeState = function() {
		if(!history.state || !_this.start) {
			_this.saveState()
		} else {
			_this.render(_this.cache[history.state], history.state, false)
		}
	},
	this.saveState = function() {
		_this.cache[window.location.pathname] = $(_this.view).contents()
		window.history.replaceState(window.location.pathname, document.title, window.location.pathname)
	},
	this.render = function(data, url, push) {
		var push = push || true
		if(_this.requests < 2) {
			_this.saveState()
			if(window.history.pushState) {
				if(push) {
					_this._cache(url, data)
					window.history.pushState(url, null, url)
				} else {
					window.history.replaceState(url, null, url)
				}
			} else if (push) {
				// window.location.hash = '!'+data.url.substring(data.url.indexOf('#'), -1)
			}
			$(_this.view).($(data))
			_this.init()
		}
	},
	this._cache = function(url, data) {
		// if(!(url in _this.cache)) {
			_this.cache[url] = data
			// setTimeout(function() {
			// 	delete _this.cache[url]
			// }, _this.cacheTimeout)
		// }
	}
	if(window.location.hash) {
		this.get(window.location.hash.replace('#!', ''))
	}
	$(document).on('click', this.enable, this.get)
	$(window).on('popstate', this.changeState)
}