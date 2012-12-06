﻿var getVCDBVehicles, getCurtDevVehicles, generateConfigTable, removeConfig;
$(function () {
    $("#tabs").tabs();
    $('#find').hide();

    $('#make').on('change', function (e) {
        $('#find').hide();
        $('#model').html('<option value="">Select a Model</option>');
        $('#model').attr('disabled', 'disabled');
        var idstr = $(this).val();
        $.getJSON('/ACES/GetModels/' + idstr, function (data) {
            $(data).each(function (i, obj) {
                var opt = '<option value="' + obj.ID + '">' + obj.ModelName + '</option>';
                $('#model').append(opt);
            });
            $('#model').removeAttr('disabled', 'disabled');
        });
    });

    $('#model').on('change', function (e) {
        if ($(this).val() == "") {
            $('#find').hide();
        } else {
            $('#find').show();
        }
    });

    $(document).on('click', 'a.add', function (e) {
        e.preventDefault();
        var aobj = $(this);
        var href = $(aobj).attr('href');
        $.getJSON(href, function (data) {
            if (data.ID > 0) {
                $(aobj).hide();
                $(aobj).after('<span class="added">Added</span>');
                getCurtDevVehicles();
            }
        })
    });

    $(document).on('click', 'a.remove', function (e) {
        e.preventDefault();
        var aobj = $(this);
        var href = $(aobj).attr('href');
        if (confirm('Are you sure you want to remove this vehicle? It will remove all submodels, configurations and part associations as well.')) {
            $.getJSON(href, function (data) {
                if (data.success) {
                    $(aobj).parent().parent().remove();
                    getVCDBVehicles();
                } else {
                    showMessage("There was a problem removing the vehicle.")
                }
            })
        }
    });

    $(document).on('click', 'a.removesubmodel', function (e) {
        e.preventDefault();
        var aobj = $(this);
        var href = $(aobj).attr('href');
        if (confirm('Are you sure you want to remove this vehicle submodel? It will remove all of the submodel\'s configurations and part associations as well.')) {
            $.getJSON(href, function (data) {
                if (data.success) {
                    $(aobj).parent().parent().remove();
                    getVCDBVehicles();
                } else {
                    showMessage("There was a problem removing the submodel.")
                }
            })
        }
    });

    $(document).on('click', 'a.showConfig', function (e) {
        e.preventDefault();
        if ($(this).parent().parent().find('div.configs').css('display') == 'none') {
            $(this).find('span.arrow').css({ WebkitTransform: 'rotate(90deg)' });
            $(this).find('span.arrow').css({ '-moz-transform': 'rotate(90deg)' });
        } else {
            $(this).find('span.arrow').css({ WebkitTransform: 'rotate(0deg)' });
            $(this).find('span.arrow').css({ '-moz-transform': 'rotate(0deg)' });
        }
        $(this).parent().parent().find('div.configs').slideToggle();
    });

    $(document).on('click', '.addconfig', function (e) {
        e.preventDefault();
        var bvid = $(this).data('bvid');
        var submodelID = $(this).data('submodelid');
        $("#config-dialog").empty();
        $.getJSON('/ACES/GetConfigs?BaseVehicleID=' + bvid + '&submodelID=' + submodelID, function (data) {
            //console.log(data);
            if (data != null && data.configs.length > 0) {
                if (data.configs.length == 1) {
                    $("#config-dialog").append("<p>There is only one configuration for this vehicle available</p>");
                } else {
                    var configtable = '<div class="configs" style="display:block;" data-bvid="' + bvid + '" data-submodelid="' + submodelID + '"><table><thead>';
                    var checkrow = '<tr>';
                    var typerow = '<tr>';
                    $(data.types).each(function (i, type) {
                        if (type.count > 1) {
                            checkrow += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                            typerow += '<th>' + type.name + '</th>';
                        }
                    });
                    checkrow += '</tr>';
                    typerow += '</tr>';
                    configtable += typerow;
                    configtable += checkrow;
                    configtable += '</thead><tbody>';
                    $(data.configs).each(function (i, config) {
                        configtable += '<tr>';
                        $(config.attributes).each(function (x, attr) {
                            if (attr.ConfigAttributeType.count > 1) {
                                configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                            }
                        });

                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                $("#config-dialog").append(configtable);
                $("#config-dialog").dialog({
                    modal: true,
                    title: "Add Vehicle Configuration",
                    width: 'auto',
                    height: 'auto',
                    buttons: {
                        "Add": function () {
                            var bvid = $('#config-dialog').find('div.configs').data('bvid');
                            var submodelID = $('#config-dialog').find('div.configs').data('submodelid');
                            var configs = new Array();
                            $('input.configattributes').each(function (i, obj) {
                                if ($(obj).is(':checked')) {
                                    configs.push($(obj).val());
                                }
                            });
                            $.getJSON('/ACES/AddConfig', { BaseVehicleID: bvid, SubmodelID: submodelID, configs: configs.join(",") }, function (data) {
                                $(data.Submodels).each(function (i, submodel) {
                                    var submodelli = $('#bv' + data.ID + 's' + submodel.SubmodelID);
                                    $(submodelli).find('div.configs').remove();
                                    var configtable = generateConfigTable(submodel);
                                    $(submodelli).append(configtable);
                                    $(submodelli).find('div.configs').show();
                                    var ccount = '<span class="vehicleCount">' + submodel.vehicles.length + '</span><span class="arrow"></span>';
                                    $(submodelli).find('a.showConfig').empty().append(ccount);
                                    $(submodelli).find('a.showConfig span.arrow').css({ WebkitTransform: 'rotate(90deg)' });
                                    $(submodelli).find('a.showConfig span.arrow').css({ '-moz-transform': 'rotate(90deg)' });
                                });
                            });
                            $(this).dialog("close");
                        },
                        "Close": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            } else {
                showMessage("There are no configurations for this vehicle");
            }
        })
    });

    $(document).on('click', '.removeconfig', function (e) {
        e.preventDefault();
        var aobj = $(this);
        var vid = $(this).data('id');
        var href = $(this).attr('href');
        $.getJSON('/ACES/checkVehicle/' + vid, function (data) {
            //console.log(data);
            var confirmmessage = '';
            var count = data.vcdb_VehicleParts.length;
            if (count > 0) {
                if (confirm('This vehicle is associated with ' + count + ' parts. Are you sure you want to delete this vehicle?')) {
                    removeConfig(href, aobj)
                }
            } else {
                removeConfig(href, aobj)
            }
        })
    });

    $(document).on('click', '.custom', function (e) {
        e.preventDefault();
        var vid = $(this).data('id');
        $.getJSON('/ACES/getNonACESConfigurationTypes/' + vid, function (data) {
            $("#config-dialog").empty();
            var selectbox = '<select name="configtype" id="configtype">';
            selectbox += '<option value="">Choose a Type</option>';
            $(data).each(function (i, type) {
                selectbox += '<option value="' + type.ID + '">' + type.name + '</option>';
            });
            selectbox += '</select>';
            var resultbox = '<ul id="configresults"></ul>';
            $('#config-dialog').append(selectbox);
            $('#config-dialog').append(resultbox);
            $("#config-dialog").dialog({
                modal: true,
                title: "Add Non-ACES Custom Vehicle Configuration Attribute",
                width: 'auto',
                height: 'auto',
                buttons: {
                    "Add": function () {
                        var selectedAttr = $("#configresults input:radio[name='cattribute']:checked").val();
                        if (selectedAttr != undefined) {
                            $.getJSON('/ACES/AddCustomConfigToVehicle', { vehicleID: vid, attrID: selectedAttr }, function (response) {
                                $(response.Submodels).each(function (i, submodel) {
                                    var submodelli = $('#bv' + response.ID + 's' + submodel.SubmodelID);
                                    $(submodelli).find('div.configs').remove();
                                    var configtable = generateConfigTable(submodel);
                                    $(submodelli).append(configtable);
                                    $(submodelli).find('div.configs').show();
                                    var ccount = '<span class="vehicleCount">' + submodel.vehicles.length + '</span><span class="arrow"></span>';
                                    $(submodelli).find('a.showConfig').empty().append(ccount);
                                    $(submodelli).find('a.showConfig span.arrow').css({ WebkitTransform: 'rotate(90deg)' });
                                    $(submodelli).find('a.showConfig span.arrow').css({ '-moz-transform': 'rotate(90deg)' });
                                });
                            });
                        } else {
                            showMessage("Select an attribute")
                        }
                    },
                    "Add As New": function () {
                        var selectedAttr = $("#configresults input:radio[name='cattribute']:checked").val();
                        if (selectedAttr != undefined) {
                            $.getJSON('/ACES/AddCustomConfig', { vehicleID: vid, attrID: selectedAttr }, function (response) {
                                $(response.Submodels).each(function (i, submodel) {
                                    var submodelli = $('#bv' + response.ID + 's' + submodel.SubmodelID);
                                    $(submodelli).find('div.configs').remove();
                                    var configtable = generateConfigTable(submodel);
                                    $(submodelli).append(configtable);
                                    $(submodelli).find('div.configs').show();
                                    var ccount = '<span class="vehicleCount">' + submodel.vehicles.length + '</span><span class="arrow"></span>';
                                    $(submodelli).find('a.showConfig').empty().append(ccount);
                                    $(submodelli).find('a.showConfig span.arrow').css({ WebkitTransform: 'rotate(90deg)' });
                                    $(submodelli).find('a.showConfig span.arrow').css({ '-moz-transform': 'rotate(90deg)' });
                                });
                            });
                        } else {
                            showMessage("Select an attribute")
                        }
                    },
                    "Close": function () {
                        $(this).dialog("close");
                    }
                }
            });
        });
    });

    $(document).on('change', '#configtype', function () {
        var typeid = $(this).val();
        if (typeid != "") {
            $.getJSON('/ACES/GetAttributesByType/' + typeid, function (data) {
                $('#configresults').empty();
                var attribs = "";
                $(data).each(function (i, obj) {
                    attribs += '<li><input type="radio" name="cattribute" value="' + obj.ID + '" /> ' + obj.value + '</li>';
                });
                $('#configresults').append(attribs);
            });
        }
    });

    $('#find').on('click', function () {
        getCurtDevVehicles();
        getVCDBVehicles();
    });

});

removeConfig = function (href,aobj) {
    $.getJSON(href, function (data) {
        if (data.success) {
            var liobj = $(aobj).closest('li');
            var count = $(liobj).find('table tbody tr').length;
            $(liobj).find('a.showConfig span.vehicleCount').html(count - 1);
            $(aobj).parent().parent().remove();
        } else {
            showMessage("There was a problem removing the vehicle.")
        }
    })
};

getCurtDevVehicles = function () {
    var makeid = $('#make').val();
    var modelid = $('#model').val();
    $('#vehicleData').empty();
    $('#loadingCurtDev').show();
    $.getJSON('/ACES/GetVehicles', { makeid: makeid, modelid: modelid }, function (vData) {
        //console.log(vData);
        $('#loadingCurtDev').hide();
        if (vData.length > 0) {
            $(vData).each(function (y, BaseVehicle) {
                var opt = '<li id="bv-' + BaseVehicle.ID + '">' + BaseVehicle.YearID + ' ' + BaseVehicle.Make.MakeName + ' ' + BaseVehicle.Model.ModelName + ((BaseVehicle.AAIABaseVehicleID != "") ? '<span class="vcdb">&#10004</span>' : '<span class="notvcdb">&times</span>') + '<span class="tools"><a class="remove" href="/ACES/RemoveBaseVehicle/' + BaseVehicle.ID + '" title="Remove Base Vehicle">&times;</a></span><ul class="submodels">';
                $(BaseVehicle.Submodels).each(function (i, submodel) {
                    opt += '<li id="bv' + BaseVehicle.ID + 's' + submodel.SubmodelID + '">' + submodel.submodel.SubmodelName.trim() + ((submodel.vcdb) ? '<span class="vcdb">&#10004</span>' : '<span class="notvcdb">&times</span>') + '<span class="tools">';
                    opt += '<a href="/ACES/RemoveSubmodel?BaseVehicleID=' + BaseVehicle.ID + '&SubmodelID=' + submodel.SubmodelID + '" class="removesubmodel" title="Remove Submodel Vehicle">&times;</a>';
                    opt += '<a href="/ACES/AddConfig?BaseVehicleID=' + BaseVehicle.ID + '&SubmodelID=' + submodel.SubmodelID + '" data-bvid="' + BaseVehicle.ID + '" data-submodelID="' + submodel.SubmodelID + '"  class="addconfig" title="Add Configuration">+</a>';
                    opt += ' <a href="#" class="showConfig" title="Show / Hide Configurations">';
                    if (submodel.vehicles.length > 0 && submodel.configlist.length > 0) {
                        opt += '<span class="vehicleCount">' + submodel.vehicles.length + '</span><span class="arrow"></span>';
                    }
                    opt += '</a>';
                    opt += '</span><span class="clear"></span>';
                    if (submodel.vehicles.length > 0 && submodel.configlist.length > 0) {
                        opt += generateConfigTable(submodel);
                    }
                });
                opt += '</ul></li>';
                $('#vehicleData').append(opt);
            });
        } else {
            $('#vehicleData').append('<p>No Vehicles</p>');
        }
    });
};

getVCDBVehicles = function () {
    var makeid = $('#make').val();
    var modelid = $('#model').val();
    $('#vcdbData').empty();
    $('#loadingVCDB').show();
    $.getJSON('/ACES/GetVCDBVehicles', { makeid: makeid, modelid: modelid }, function (vcdbData) {
        $('#loadingVCDB').hide();
        if (vcdbData.length > 0) {
            $(vcdbData).each(function (i, obj) {
                var opt = '<li>' + obj.Year + ' ' + obj.Make.MakeName + ' ' + obj.Model.ModelName;
                if (!obj.exists) {
                    opt += '<span class="tools"><a href="/ACES/AddBaseVehicle/' + obj.BaseVehicleID + '" data-id="' + obj.BaseVehicleID + '" class="add" title="Add Base Vehicle">+</a></span>';
                }
                opt += '<ul class="submodels">';
                $(obj.Vehicles).each(function (y, vehicle) {
                    opt += '<li>' + vehicle.Submodel.SubmodelName.trim() + ' (' + vehicle.Region.RegionAbbr + ')'
                    opt += '<span class="tools">';
                    if (!vehicle.exists) {
                        opt += '<a href="/ACES/AddSubmodel?basevehicleid=' + obj.BaseVehicleID + '&submodelid=' + vehicle.Submodel.SubmodelID + '" class="add" title="Add Submodel">+</a>';
                    }
                    if (vehicle.Configs.length > 0) {
                        opt += ' <a href="#" class="showConfig" title="Show / Hide Configurations">' + vehicle.Configs.length + '<span class="arrow"></span></a>';
                    }
                    opt += '</span><span class="clear"></span>';
                    if (vehicle.Configs.length > 0) {
                        opt += '<div class="configs"><table>';
                        opt += '<thead><tr><th>Body Type</th><th>Doors</th><th>Engine</th><th>Engine Version</th><th>Valves</th><th>Drive Type</th><th>Fuel Type</th><th>Transmission</th><th>Bed Config</th><th>ABS</th><th>Brake System</th><th>Front Brakes</th><th>Rear Brakes</th><th>Wheel Base</th><th>MFR Body Code</th></tr></thead><tbody>';
                        $(vehicle.Configs).each(function (x, config) {
                            opt += '<tr>';
                            opt += '<td>' + config.BodyStyleConfig.BodyType.BodyTypeName.trim() + '</td><td>' + config.BodyStyleConfig.BodyNumDoor.BodyNumDoors.trim() + '-dr</td>';
                            opt += '<td>' + config.EngineConfig.EngineBase.Liter.trim() + 'L ' + config.EngineConfig.EngineBase.BlockType.trim() + config.EngineConfig.EngineBase.Cylinders.trim() + '</td><td>' + config.EngineConfig.EngineVersion.EngineVersion1.trim() + '</td><td>' + config.EngineConfig.Valve.ValvesPerEngine.trim();
                            opt += '<td>' + config.DriveType.DriveTypeName.trim() + '</td><td>' + config.EngineConfig.FuelType.FuelTypeName.trim() + '</td>';
                            opt += '<td>' + config.Transmission.TransmissionBase.TransmissionNumSpeed.TransmissionNumSpeeds.trim() + '-SP ' + config.Transmission.TransmissionBase.TransmissionControlType.TransmissionControlTypeName.trim() + ' ' + config.Transmission.TransmissionBase.TransmissionType.TransmissionTypeName.trim() + '</td>';
                            if (config.BedConfig.BedLength.BedLength1.trim() != 'N/R' && config.BedConfig.BedType.BedTypeName.trim() != 'N/R') {
                                opt += '<td>' + config.BedConfig.BedLength.BedLength1.trim() + ' In. ' + config.BedConfig.BedType.BedTypeName.trim() + '</td>';
                            } else {
                                opt += '<td></td>';
                            }
                            opt += '<td>' + config.BrakeConfig.BrakeAB.BrakeABSName.trim() + '</td><td>' + config.BrakeConfig.BrakeSystem.BrakeSystemName.trim() + '</td><td>' + config.BrakeConfig.FrontBrakeType.BrakeTypeName + '</td><td>' + config.BrakeConfig.RearBrakeType.BrakeTypeName + '</td>';
                            if (config.WheelBase.WheelBase1.trim() != '-') {
                                opt += '<td>' + config.WheelBase.WheelBase1.trim() + ' In.</td>';
                            } else {
                                opt += '<td></td>';
                            }
                            opt += '<td>' + config.MfrBodyCode.MfrBodyCodeName.trim() + '</td>';
                            opt += '</tr>';
                        });
                        opt += '</tbody></table></div>'
                    }
                });
                opt += '</ul></li>';
                $('#vcdbData').append(opt);
            });
        } else {
            $('#vcdbData').append('<p>No Vehicles</p>');
        }
    });
};

generateConfigTable = function (submodel) {
    var configTable = "";
    configTable += '<div class="configs"><table>';
    configTable += '<thead><tr>';
    configTable += '<th>VCDB</th>'
    $(submodel.configlist).each(function (z, config) {
        configTable += '<th>' + config.name + '</th>';
    });
    configTable += '<th></th>';
    configTable += '</tr></thead><tbody>';
    $(submodel.vehicles).each(function (x, vehicle) {
        configTable += '<tr>';
        configTable += '<td>' + ((vehicle.vcdb) ? '<span class="vcdb">&#10004</span>' : '<span class="notvcdb">&times</span>') + '</td>';
        $(submodel.configlist).each(function (z, config) {
            configTable += '<td>';
            $(vehicle.configs).each(function (q, attr) {
                if (attr.ConfigAttributeType.name == config.name) {
                    configTable += attr.value;
                }
            });
            configTable += '</td>';
        });
        configTable += '<td><a href="#" class="custom" data-id="' + vehicle.ID + '" title="Custom Configuration">Custom</a> | <a href="/ACES/removeVehicle/' + vehicle.ID + '" data-id="' + vehicle.ID + '" class="removeconfig" title="Remove Configuration">&times;</a></td></tr>'
    });
    configTable += '</tbody></table></div>';
    return configTable;
};

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
    return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
    return this.replace(/\s+$/,"");
}