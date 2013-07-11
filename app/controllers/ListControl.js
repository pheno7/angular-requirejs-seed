define(["app/components/Localization"], function (Localization)
{
	var DefaultSettings =
	{
		// Base service url
		serviceUrl:"http://ajax.googleapis.com/ajax/services/feed/load?callback=JSON_CALLBACK&hl=ja&output=json-in-script&v=1.0&num=10&q=",

		// Feeds example for list sources
		feeds: {
			feed1: "http://rss.sciam.com/sciam/alternative-energy-technology",
			feed2: "http://rss.sciam.com/sciam/technology"
		}
	}

	function ListControl($scope, $http, $routeParams, $location, Page)
	{
		// Create instance settings
		var settings = angular.extend({}, DefaultSettings);

		// Create/get model
		var model = {
			// Set name from url param
			name: $routeParams.name,
			locales: Localization.locales.list,
			// For example, you can set initial title to "loading..." until feed is ready
			title: Localization.locales.loading.title
		};


		function init()
		{
			Page.setDefaultTitle();

			load();
			
			// Assign model to Angular scope
			$scope.model = model;
		}
		
		function load()
		{
			// RSS feed example to populate the item list
			var rssFeedUrl = settings.feeds[model.name];

			// Feed not found, redirect to 404
			if(!rssFeedUrl)
			{
				$location.url("/404");
				return;
			}

			// Load the feed with Angular http.jsonp
			// http://docs.angularjs.org/api/ng.$http#jsonp
			$http.jsonp(settings.serviceUrl+rssFeedUrl, {}).
			success(function(response, status, headers, config)
			{
				console.log(response);

				var data = response.responseData;

				if(data.feed)
				{
					model.title = data.feed.title;
					model.items = data.feed.entries;

					// Set page title
					Page.title(model.title);

					// Act on items data here (hacking content example)
					// A more powerful way of dealing with @ http://reactive-extensions.github.io/RxJS/
					for(var i=0; i<model.items.length; i++)
					{
						var item = model.items[i];
						var contentEndIndex = item.content.indexOf("[More]");
						if(contentEndIndex==-1) contentEndIndex = item.content.indexOf("-- Read more");
						if(contentEndIndex>-1)
						{
							item.content = item.content.substring(0, contentEndIndex);
						}
					}

					// Important, if you are using another library for XHR and the template digest is already done, 
					// your must reload ng-repeat way: (more info @ http://stackoverflow.com/questions/12463902/how-does-the-binding-and-digesting-work-in-angularjs)
					if(!$scope.$$phase) {
						$scope.$digest();
					}
				}
			}).
			error(function(data, status, headers, config)
			{
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
		}

		// Auto-init
		init();

		// You can expose public methods of this controller instance this way
		this.load = load;

		return this;
	}

	return ListControl;
});