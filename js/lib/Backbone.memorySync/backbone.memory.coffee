# ##UTILS
# function for generating "random" id of objects in DB
S4 = -> 
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1)

guid = ->
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    
# ## Memory Store
# a backend storage that work only in memory
class MemoryStore
  constructor: (@db) ->
    @store = {}
  
  create: (model) ->
    # when you want use your id as identifier, use apiid attribute
    if model.attributes.apiid
      model.id = model.attributes.id = model.attributes.apiid
    else
      model.id = model.attributes.id = guid()
    @store[model.id] = model

  update: (model) ->
    @store[model.id] = model if model.id

  destroy: (model) ->
    id = model.id || model.attributes.id
    @store[id] = undefined
  
  find: (model) ->
    id = model.id || model.attributes.id
    @store[id]
  
  findAll: (model) ->
    all = (value for key, value of @store)

# Backbone.sync with memory
Backbone.memorySync = (method, model, options) ->
  store = model.store || model.collection.store
  
  unless store
  	console.warn "[BACKBONE-MEMORY] model without store object -> ", model
  	return
  
  result = switch method
    when "read"
      if model.id
        store.find(model)
      else
        store.findAll(model)
    when "create"
      store.create(model)
    when "update"
      store.update(model)
    when "delete"
      store.destroy(model)
    else
      nil

  if result 
    options.success(result)

# Override 'Backbone.sync' to default to memorySync,
# the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
window.Store      = MemoryStore
Backbone.ajaxSync = Backbone.sync
Backbone.sync     = Backbone.memorySync