
ecs.entity = function() {
    return new ecs.Entity();
};

var components = {};

ecs.component = function(name, props) {
    var CompClass;

    if (props === undefined) {
        CompClass = components[name] || ecs.Component;
    } else {
        CompClass = function() {

        }
        Component.extend(CompClass, props);
        components[name] = CompClass;
    }

    return CompClass;
};

ecs.instance = function(ele, data) {
    var $ele = $(ele);
    var comp = $ele.attr('ecs-component');
    var CompClass;
    var component;

    if (comp) {
        CompClass = ecs.component(comp) || Component;
    } else {
        CompClass = Component;
    }

    component = new CompClass();

    $ele.attr('ecs-alive', true);
    
    component.$container = $ele;
    component.globalData = data;
    component.onData(data);

    return component;
}
