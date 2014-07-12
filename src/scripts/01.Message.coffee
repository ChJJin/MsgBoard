Message = Backbone.Model.extend
	defaults: ()->
		defaultVal = 
			name: '匿名用户'
			content: '..'
			createdAt: Date.now()
			reply: []
