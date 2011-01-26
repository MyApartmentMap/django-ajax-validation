(function($) {
    function inputs(form)   {
        return form.find(":input:visible:not(:button)");
    }

    $.fn.validate = function(url, settings) {
        settings = $.extend({
            type: 'table',
            callback: false,
            fields: false,
            dom: this,
            event: 'submit',
            form_filter: {
              '__all__': function(form, key) {return inputs(form).filter(':first').parent()},
              '*': function(form, key) {return inputs(form).filter(':first[id^=id_' + key.replace('__all__', '') + ']').parent()}
            },
            submitHandler: null,
            ifSuccess: null,
            ifError: null
        }, settings);

        return this.each(function() {
            var form = $(this);
            settings.dom.bind(settings.event, function()  {
                var status = false;
                var data = form.serialize();
                if (settings.fields) {
                    data += '&' + $.param({fields: settings.fields});
                }
                $.ajax({
                    async: false,
                    data: data,
                    dataType: 'json',
                    traditional: true,
                    error: function(XHR, textStatus, errorThrown)   {
                        status = true;
                    },
                    success: function(data, textStatus) {
                        status = data.valid;
                        if (!status)    {
                            if (settings.callback)  {
                                settings.callback(data, form);
                            }
                            else    {
                                var get_form_error_position = function(key) {
                                    key = key || '__all__';
                                    if (key in settings.form_filter) {
                                      $e = settings.form_filter[key](form, key);
                                    } else {
                                      $e = settings.form_filter['*'](form, key);
                                    }
                                    return $e;
                                };
                                if (settings.type == 'p')    {
                                    form.find('ul.errorlist').remove();
                                    $.each(data.errors, function(key, val)  {
                                        if (key.indexOf('__all__') >= 0)   {
                                            var error = get_form_error_position(key);
                                            if (error.prev().is('ul.errorlist')) {
                                                error.prev().before('<ul class="errorlist all"><li>' + val + '</li></ul>');
                                            }
                                            else    {
                                                error.before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                            }
                                        }
                                        else    {
                                            $('#' + key).parent().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    });
                                }
                                if (settings.type == 'table')   {
                                    inputs(form).prev('ul.errorlist').remove();
                                    form.find('tr:has(ul.errorlist)').remove();
                                    $.each(data.errors, function(key, val)  {
                                        if (key.indexOf('__all__') >= 0)   {
                                            get_form_error_position(key).parent().before('<tr><td colspan="2"><ul class="errorlist all"><li>' + val + '.</li></ul></td></tr>');
                                        }
                                        else    {
                                            $('#' + key).before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    });
                                }
                                if (settings.type == 'ul')  {
                                    inputs(form).prev().prev('ul.errorlist').remove();
                                    form.find('li:has(ul.errorlist)').remove();
                                    $.each(data.errors, function(key, val)  {
                                        if (key.indexOf('__all__') >= 0)   {
                                            get_form_error_position(key).before('<li><ul class="errorlist all"><li>' + val + '</li></ul></li>');
                                        }
                                        else    {
                                            $('#' + key).prev().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    });
                                }
                                if (settings.type == 'inline') {
                                    form.find('ul.errorlist').remove();
                                    $.each(data.errors, function(key, val)  {
                                        if (key.indexOf('__all__') >= 0)   {
                                            get_form_error_position(key).before('<ul class="errorlist all"><li>' + val + '</li></ul>');
                                        }
                                        else    {
                                            $('#' + key).before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    });
                                }
                            }
                            
                            if (settings.ifError)
                                settings.ifError(form, data);
                        } else {
                            // Remove any remaining errors
                            form.find('ul.errorlist').remove();
                            
                            if (form.find('ul.errorlist').size() == 0) {
                                if (settings.ifSuccess)
                                    settings.ifSuccess(form, data);
                            }
                        }
                    },
                    type: 'POST',
                    url: url
                });
                if (status && settings.submitHandler) {
                    return settings.submitHandler.apply(this);
                }
                return status;
            });
        });
    };
})(jQuery);
