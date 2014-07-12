MessageList = Backbone.Collection.extend
	model: Message
	comparator: 'createdAt'
	url: '/message'

	initialize: (models, options)->
		@hasNext = true
		@offset = 0
		_.extend @, options

	parse: (res)->
		res.slice 0, @pageSize

	getNextPage: ()-> if @hasNext
		@fetch
			data: {offset: @offset, pageSize: @pageSize+1}
			success: (coll, res)=>
				@hasNext = res.length is @pageSize + 1
				@offset += @pageSize
				@trigger 'after-get-new-page', @hasNext

	createMsg: (msg)-> if msg
		@create {
			content: msg
		}, {
			success: (model, res)=>
				@offset += 1
		}

# mock data
Backbone.sync = (method, model, options)->
	console.log arguments
	{offset, pageSize} = options.data ? {offset: 0, pageSize: 2}
	ret = []
	for i in [0...pageSize]
		ret.push {createdAt: offset+i}
	options.success ret

messageList = new MessageList [], {pageSize: 15}
