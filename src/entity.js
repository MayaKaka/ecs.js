
function Entity () {
    this._comps = {};
    this._events = {};
}

ecs.extend(Entity, {
    _comps: null,
    _events: null,

    add: function(name, component) {
        this._comps[name] = component;
    
        component.owner = this;
        component._beforeCreate();
        component.onCreate();
        component._afterCreate();
    },

    remove: function(name) {
        var component = this._comps[name];

        if (component) {
            component.onDestroy();
            component.owner = null;

            delete this._comps[name];
        }
    },

    get: function(name) {
        return this._comps[name];
    },

    on: function(name, handler) {
        this._events[name] = handler;
    },

    off: function(name) {
        delete this._events[name];
    },

    trigger: function(name, data) {
        var handler = this._events[name];

        if (typeof(handler) === 'function') {
            handler.call(this, data);
        }
    }

});

ecs.Entity = Entity;
