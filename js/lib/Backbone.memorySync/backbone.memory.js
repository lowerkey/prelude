var MemoryStore, S4, guid;
S4 = function() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
guid = function() {
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};
MemoryStore = (function() {
  function MemoryStore(db) {
    this.db = db;
    this.store = {};
  }
  MemoryStore.prototype.create = function(model) {
    if (model.attributes.apiid) {
      model.id = model.attributes.id = model.attributes.apiid;
    } else {
      model.id = model.attributes.id = guid();
    }
    return this.store[model.id] = model;
  };
  MemoryStore.prototype.update = function(model) {
    if (model.id) {
      return this.store[model.id] = model;
    }
  };
  MemoryStore.prototype.destroy = function(model) {
    var id;
    id = model.id || model.attributes.id;
    return this.store[id] = void 0;
  };
  MemoryStore.prototype.find = function(model) {
    var id;
    id = model.id || model.attributes.id;
    return this.store[id];
  };
  MemoryStore.prototype.findAll = function(model) {
    var all, key, value;
    return all = (function() {
      var _ref, _results;
      _ref = this.store;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(value);
      }
      return _results;
    }).call(this);
  };
  return MemoryStore;
})();
Backbone.memorySync = function(method, model, options) {
  var resp, store, syncDfd, errorMessage;
  // adapted by Joshua Moore
  if(model.store){
    store = model.store;
  }else if(model.collection.store){
    store = model.collection.store;   
  }else{
    throw "No Store";  
  }
  syncDfd = $.Deferred && $.Deferred();
  if (!store) {
    console.warn("[BACKBONE-MEMORY] model without store object -> ", model);
    return;
  }
  
  try {

    switch (method) {
      case "read":
        resp = model.id != undefined ? store.find(model) : store.findAll();
        break;
      case "create":
        resp = store.create(model);
        break;
      case "update":
        resp = store.update(model);
        break;
      case "delete":
        resp = store.destroy(model);
        break;
    }

  } catch(error) {
    if (error.code === DOMException.QUOTA_EXCEEDED_ERR && window.localStorage.length === 0)
      errorMessage = "Private browsing is unsupported";
    else
      errorMessage = error.message;
  }

  if (resp) {
    if (options && options.success)
      if (Backbone.VERSION === "0.9.10") {
        options.success(model, resp, options);
      } else {
        options.success(resp);
      }
    if (syncDfd)
      syncDfd.resolve(resp);

  } else {
    errorMessage = errorMessage ? errorMessage
                                : "Record Not Found";
    
    if (options && options.error)
      if (Backbone.VERSION === "0.9.10") {
        options.error(model, errorMessage, options);
      } else {
        options.error(errorMessage);
      }
      
    if (syncDfd)
      syncDfd.reject(errorMessage);
  }
  
  // add compatibility with $.ajax
  // always execute callback for success and error
  if (options && options.complete) options.complete(resp);

  return syncDfd && syncDfd.promise();
};

//window.Store = MemoryStore;
//Backbone.ajaxSync = Backbone.sync;
//Backbone.sync = Backbone.memorySync;