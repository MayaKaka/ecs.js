
var getter = function(key2Data) {
    return function() {
        return this[key2Data];
    }
}

var bindings = {
    text: {
        defaultValue: '',
        getter: getter,
        setter: function(key2Data, $ele) {
            return function(v) {
                this[key2Data] = v;
                $ele.text(v);
            }
        }
    },
    html: {
        defaultValue: '',
        getter: getter,
        setter: function(key2Data, $ele) {
            return function(v) {
                this[key2Data] = v;
                $ele.html(v);
            }
        }
    },
    value: {
        defaultValue: '',
        getter: getter,
        setter: function(key2Data, $ele, self) {
            $ele.on('change input', function() {
                self[key2Data] = $ele.val();
            });

            return function(v) {
                this[key2Data] = v;
                $ele.val(v);
            }
        }
    },
    checked: {
        defaultValue: false,
        getter: getter,
        setter: function(key2Data, $ele, self) {
            $ele.on('change', function() {
                self[key2Data] = $ele[0]['checked'];
            });

            return function(v) {
                this[key2Data] = v;
                $ele[0]['checked'] = v;
            }
        }
    },
    visible: {
        defaultValue: false,
        getter: getter,
        setter: function(key2Data, $ele) {
            return function(v) {
                this[key2Data] = v;
                if (v) {
                    $ele.show();
                } else {
                    $ele.hide();
                }
            }
        }
    }
}


function Component () {

}

ecs.extend(Component, {
    
    $container: null,
    globalData: null,

    data: null,
    owner: null,

    template: null,
    style: null,

    handlers: null,

    onCreate: function() {
        
    },

    onDestroy: function() {
        
    },

    onData: function(data) {
        this.data = {};

        for (var key in data) {
            this.data[key] = data[key];
        }
    },

    _bindKeyValue: function(type, key, $ele) {
        var data = this.data;
        var binding = bindings[type];
        var key2Data = '__data__' + key;
        /* getter-setter */
        var getter = binding.getter(key2Data);
        var setter = binding.setter(key2Data, $ele, data);

        setter.call(data, data[key] !== undefined ? data[key] : binding.defaultValue);
        
        /* 获取getter-setter */
        data.__defineGetter__(key, getter);
        data.__defineSetter__(key, setter);
    },

    _bindKeyEvent: function(type, key, $ele) {
        var self = this;
        var data = this.data;
        var binding = bindings[type];
        var handler = this.handlers && this.handlers[key];

        if (handler) {
            $ele.on(type, function(evt) {
                handler.call(self, evt);
            });
        }
    },

    _beforeCreate: function() {
        var $container = this.$container;
        var template = this.template;
        var style = this.style;

        /* 插入样式 */
        if (style) {
            var $head = $(document.head);
            var styleId = 'ecs_' + this._classId; 

            if (!$head.find('#' + styleId).length) {
                $head.append('<style id="'+ styleId +'">'+ style +'</style>');
            }
        }

        /* 生成dom元素 */
        if (template && $container && !$container.children().length) {
            $container.html(template);
        }
    },

    _afterCreate: function() {
        var self = this;
        var $container = this.$container;
        var globalData = this.globalData;
        var data = this.data;
        var owner = this.owner;

        var $components;
        var $bindings;

        if (!$container) {
            return;
        }

        $components = $container.find('[ecs-component]');
        $bindings = $container.find('[ecs-text],[ecs-html],[ecs-value],[ecs-checked],[ecs-visible],[ecs-click],[ecs-change],[ecs-input]');

        /* 解析组件 */
        if ($components.length) {
            $components.each(function(i, ele) {
                var $ele = $(ele);
                var alive = $ele.attr('ecs-alive');
                var comp = $ele.attr('ecs-component');
                var name = $ele.attr('ecs-name');
                var CompClass = ecs.component(comp);
                var component;

                if (!alive && CompClass) {
                    $ele.attr('ecs-alive', true);

                    component = new CompClass();
                    component.$container = $ele;

                    if (globalData) {
                        component.globalData = globalData;
                    }
                    
                    component.onData(globalData ? globalData[name] : data[name]);    // 优先使用全局数据
                    
                    owner.add(name, component);
                }
            });
        }

        /* 解析键值绑定 */
        if ($bindings.length) {
            $bindings.each(function(i, ele) {
                var $ele = $(ele);
                var alive = $ele.attr('ecs-alive');

                if (!alive) {
                    $ele.attr('ecs-alive', true);
                    
                    ['ecs-text', 'ecs-html', 'ecs-value', 'ecs-checked', 'ecs-visible'].forEach(function(a, i) {
                        var key = $ele.attr(a);

                        if (key) {
                            self._bindKeyValue(a.split('-')[1], key, $ele);    
                        }
                    });

                    ['ecs-click', 'ecs-change', 'ecs-input'].forEach(function(a, i) {
                        var key = $ele.attr(a);

                        if (key) {
                            self._bindKeyEvent(a.split('-')[1], key, $ele);    
                        }
                    });
                }
                
            });
        }

        if (this.globalData) {
            delete this.globalData;
        }
    }

});

ecs.Component = Component;