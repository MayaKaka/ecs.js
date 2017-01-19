
var ecs = {};
var classId = 0;

ecs.extend = function(SubClass, props) {
    var proto;

    if (typeof(this) === 'function') {
        proto = new this();
    } else {
        proto = {};
    }

    proto.constructor = SubClass;
    proto._classId = classId++;
    
    for (var i in props) {
        proto[i] = props[i];
    }

    SubClass.extend = ecs.extend;
    SubClass.prototype = proto;
};