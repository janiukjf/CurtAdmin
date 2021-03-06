﻿var getVCDBVehicles, getCurtDevVehicles, generateConfigTable, removeConfig, generateVehicleConfigs, loadNotes;
$(function () {
    $("#tabs").tabs();
    $('#find').hide();

    $('#make').on('change', function (e) {
        $('#find').hide();
        $('#model').html('<option value="">Select a Model</option>');
        $('#model').attr('disabled', 'disabled');
        var idstr = $(this).val();
        if (idstr == "") return;
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
            if (data == null || (data.BodyStyles.length == 0 && data.WheelBases.length == 0 && data.MfrBodyCodes.length == 0
                && data.DriveTypes.length == 0 && data.Beds.length == 0 && data.Steering.length == 0 && data.Springs.length == 0
                && data.Brakes.length == 0 && data.Engines.length == 0 && data.Transmissions.length == 0)) {
                $("#config-dialog").append("<p>There are no configurations for this vehicle in the VCDB</p>");
            } else {
                var configcount = 0;
                var configtable = '<div class="configs" style="display:block;" data-bvid="' + bvid + '" data-submodelid="' + submodelID + '">';
                if (data.BodyStyles.length > 1) {
                    if (data.BodyStyles.length > configcount) {
                        configcount = data.BodyStyles.length;
                    }
                    configtable += '<div class="configtable"><p>Body Styles</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.BodyStyles[0].types).each(function(i,type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.BodyStyles).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.WheelBases.length > 1) {
                    if (data.WheelBases.length > configcount) {
                        configcount = data.WheelBases.length;
                    }
                    configtable += '<div class="configtable"><p>Wheel Base</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.WheelBases[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.WheelBases).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.MfrBodyCodes.length > 1) {
                    if (data.MfrBodyCodes.length > configcount) {
                        configcount = data.MfrBodyCodes.length;
                    }
                    configtable += '<div class="configtable"><p>Mfr Body Codes</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.MfrBodyCodes[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.MfrBodyCodes).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.DriveTypes.length > 1) {
                    if (data.DriveTypes.length > configcount) {
                        configcount = data.DriveTypes.length;
                    }
                    configtable += '<div class="configtable"><p>Drive Types</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.DriveTypes[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.DriveTypes).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.Beds.length > 1) {
                    if (data.Beds.length > configcount) {
                        configcount = data.Beds.length;
                    }
                    configtable += '<div class="configtable"><p>Bed</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.Beds[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.Beds).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.Steering.length > 1) {
                    if (data.Steering.length > configcount) {
                        configcount = data.Steering.length;
                    }
                    configtable += '<div class="configtable"><p>Steering</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.Steering[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.Steering).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.Springs.length > 1) {
                    if (data.Springs.length > configcount) {
                        configcount = data.Springs.length;
                    }
                    configtable += '<div class="configtable"><p>Springs</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.Springs[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.Springs).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }

                if (data.Brakes.length > 1) {
                    if (data.Brakes.length > configcount) {
                        configcount = data.Brakes.length;
                    }
                    configtable += '<div class="configtable"><p>Brakes</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.Brakes[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.Brakes).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.Engines.length > 1) {
                    if (data.Engines.length > configcount) {
                        configcount = data.Engines.length;
                    }
                    configtable += '<div class="configtable"><p>Engines</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.Engines[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.Engines).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                if (data.Transmissions.length > 1) {
                    if (data.Transmissions.length > configcount) {
                        configcount = data.Transmissions.length;
                    }
                    configtable += '<div class="configtable"><p>Transmissions</p><table><thead>'
                    var tabletop = '';
                    var tablebot = '';
                    $(data.Transmissions[0].types).each(function (i, type) {
                        tabletop += '<th>' + type.name + '</th>';
                        tablebot += '<th><input type="checkbox" class="configattributes" value="' + type.ID + '" /></th>';
                    });
                    configtable += '<tr>' + tabletop + '</tr><tr>' + tablebot + '</tr></thead><tbody>';
                    $(data.Transmissions).each(function (i, config) {
                        configtable += '<tr>'
                        $(config.attributes).each(function (i, attr) {
                            configtable += '<td class="configattr" data-id="' + attr.vcdbID + '">' + attr.value + '</td>';
                        });
                        configtable += '</tr>';
                    });
                    configtable += '</tbody></table></div>';
                }
                configtable += '</div>';
                if (configcount < 2) {
                    configtable = '<p>There is only one configuration for this vehicle.</p>'
                }
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
                $("#config-dialog").empty();
                var partsmessage = "<p>This vehicle is associated with the following parts:</p><ul>";
                $(data.vcdb_VehicleParts).each(function (i, part) {
                    partsmessage += '<li><a target="_blank" href="/Product/EditACESVehicles?partID=' + part.PartNumber + '">' + part.PartNumber + '</a></li>';
                });
                partsmessage += "</ul><p>Are you sure you want to delete this vehicle?</p>";
                $('#config-dialog').append(partsmessage)
                $("#config-dialog").dialog({
                    modal: true,
                    title: "Remove Vehicle",
                    width: 'auto',
                    height: 'auto',
                    buttons: {
                        "Delete": function () {
                            removeConfig(href, aobj)
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
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
                        var dialogbox = $(this);
                        var selectedAttr = $("#configresults input:radio[name='cattribute']:checked").val();
                        if (selectedAttr != undefined) {
                            // check if adding would create a duplicate vehicle
                            $.getJSON('/ACES/checkVehicleExists', { vehicleID: vid, attributeID: selectedAttr, method: "add" }, function (existsData) {
                                if (existsData == 0) {
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
                                    // DUPLICATE!!!
                                    $("#config-dialog").empty();
                                    var warningmsg = "<p>A Vehicle already exists with the configuration you would create if you added the attribute you chose. ";
                                    warningmsg += "You can either merge the parts from the current vehicle into the target one or you can cancel.</p>";
                                    warningmsg += "<p>How would you like to proceed?</p>";
                                    $("#config-dialog").append(warningmsg);
                                    $("#config-dialog").dialog({
                                        modal: true,
                                        title: "WARNING: Duplicate Vehicle Ahead!!",
                                        width: 400,
                                        height: 'auto',
                                        buttons: {
                                            "Merge": function () {
                                                var dialogbox = $(this);
                                                $.getJSON('/ACES/MergeVehicles', { targetID: existsData, currentID: vid }, function (response) {
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
                                                    $(dialogbox).dialog("close");
                                                });
                                            },
                                            "Cancel": function () {
                                                $(this).dialog("close");
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            showMessage("Select an attribute")
                        }
                    },
                    "Add As New": function () {
                        var dialogbox = $(this);
                        var selectedAttr = $("#configresults input:radio[name='cattribute']:checked").val();
                        if (selectedAttr != undefined) {
                            // check if adding would create a duplicate vehicle
                            $.getJSON('/ACES/checkVehicleExists', { vehicleID: vid, attributeID: selectedAttr, method: "add" }, function (existsData) {
                                //console.log(existsData);
                                if (existsData == 0) {
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
                                    // DUPLICATE!!!
                                    $(dialogbox).dialog("close");
                                    $("#config-dialog").empty();
                                    var warningmsg = "<p>A Vehicle already exists with the configuration you would create if you added the attribute you chose. ";
                                    warningmsg += "You can either merge the parts from the current vehicle into the target one or you can cancel.</p>";
                                    warningmsg += "<p>How would you like to proceed?</p>";
                                    $("#config-dialog").append(warningmsg);
                                    $("#config-dialog").dialog({
                                        modal: true,
                                        title: "WARNING: Duplicate Vehicle Ahead!!",
                                        width: 400,
                                        height: 'auto',
                                        buttons: {
                                            "Merge": function () {
                                                var dialogbox = $(this);
                                                $.getJSON('/ACES/MergeVehicles', { targetID: existsData, currentID: vid, deleteCurrent: false }, function (response) {
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
                                                    $(dialogbox).dialog("close");
                                                });
                                            },
                                            "Cancel": function () {
                                                $(this).dialog("close");
                                            }
                                        }
                                    });
                                }
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

    $(document).on('click', 'a.removeattribute', function (e) {
        e.preventDefault();
        var aobj = $(this);
        var vID = $(this).data('vehicleid');
        var attrID = $(this).data('attrid');
        $.getJSON('/ACES/checkVehicleExists', { vehicleID: vID, attributeID: attrID }, function (data) {
            if (data == 0) {
                // delete
                $.getJSON('/ACES/removeAttribute', { vehicleID: vID, attributeID: attrID }, function (response) {
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
                $("#config-dialog").empty();
                var warningmsg = "<p>A Vehicle already exists with the configuration you would create if you remove the attribute you chose. ";
                warningmsg += "You can either merge the parts from the current vehicle into the target one, or you can delete the vehicle entirely.</p>";
                warningmsg += "<p>How would you like to proceed?</p>";
                $("#config-dialog").append(warningmsg);
                $("#config-dialog").dialog({
                    modal: true,
                    title: "WARNING: Duplicate Vehicle Ahead!!",
                    width: 400,
                    height: 'auto',
                    buttons: {
                        "Merge": function () {
                            var dialogbox = $(this);
                            $.getJSON('/ACES/MergeVehicles', { targetID: data, currentID: vID }, function (response) {
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
                                $(dialogbox).dialog("close");
                            });
                        },
                        "Delete": function () {
                            removeConfig('/ACES/removeVehicle/' + vID, aobj);
                            $(this).dialog("close");
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            }
        });
    });

    $(document).on('click', '.change', function (e) {
        e.preventDefault();
        var vID = $(this).data('id');
        $.getJSON('/ACES/getConfigsByVehicle/' + vID, function (data) {
            //console.log(vID);
            //console.log(data);
            generateVehicleConfigs(data,vID);
            $("#config-dialog").dialog({
                modal: true,
                title: "Change Vehicle Configuration",
                width: 'auto',
                height: 'auto',
                buttons: {
                    "Add": function () {
                        var dialogbox = $(this);
                        var cobj = $('input.addedAttrib:checked');
                        if (cobj.length > 0) {
                            var vcdbID = $(cobj).data('id');
                            var typeID = $(cobj).data('typeid');
                            var value = $(cobj).data('value');
                            $.getJSON('/ACES/checkVehicleAndNewAttributeExists', { vehicleID: vID, vcdbID: vcdbID, typeID: typeID, textvalue: value }, function (existsdata) {
                                if (existsdata == 0) {
                                    // no duplicates exist...add attribute
                                    $.getJSON('/ACES/addAttributeToVehicle', { vehicleID: vID, vcdbID: vcdbID, typeID: typeID, value: value }, function (response) {
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
                                        $.getJSON('/ACES/getConfigsByVehicle/' + vID, function (configdata) { generateVehicleConfigs(configdata, vID); })
                                    });
                                } else {
                                    $("#config-dialog").empty();
                                    var warningmsg = "<p>A Vehicle already exists with the configuration you would create if you add the attribute you chose. ";
                                    warningmsg += "You can either merge the parts from the current vehicle into the target one, or you can cancel.</p>";
                                    warningmsg += "<p>How would you like to proceed?</p>";
                                    $("#config-dialog").append(warningmsg);
                                    $("#config-dialog").dialog({
                                        modal: true,
                                        title: "WARNING: Duplicate Vehicle Ahead!!",
                                        width: 400,
                                        height: 'auto',
                                        buttons: {
                                            "Merge": function () {
                                                var dialogbox = $(this);
                                                $.getJSON('/ACES/MergeVehicles', { targetID: existsdata, currentID: vID }, function (response) {
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
                                                    $(dialogbox).dialog("close");
                                                });
                                            },
                                            "Cancel": function () {
                                                $(this).dialog("close");
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            showMessage('No attributes selected');
                        }
                    },
                    "Add As New": function () {
                        var dialogbox = $(this);
                        var cobj = $('input.addedAttrib:checked');
                        if (cobj.length > 0) {
                            var vcdbID = $(cobj).data('id');
                            var typeID = $(cobj).data('typeid');
                            var value = $(cobj).data('value');
                            $.getJSON('/ACES/checkVehicleAndNewAttributeExists', { vehicleID: vID, vcdbID: vcdbID, typeID: typeID, textvalue: value }, function (existsdata) {
                                if (existsdata == 0) {
                                    // no duplicates exist...add attribute
                                    $.getJSON('/ACES/addAttribute', { vehicleID: vID, vcdbID: vcdbID, typeID: typeID, value: value }, function (response) {
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
                                    $("#config-dialog").empty();
                                    var warningmsg = "<p>A Vehicle already exists with the configuration you would create if you add the attribute you chose. ";
                                    warningmsg += "You can either merge the parts from the current vehicle into the target one, or you can cancel.</p>";
                                    warningmsg += "<p>How would you like to proceed?</p>";
                                    $("#config-dialog").append(warningmsg);
                                    $("#config-dialog").dialog({
                                        modal: true,
                                        title: "WARNING: Duplicate Vehicle Ahead!!",
                                        width: 400,
                                        height: 'auto',
                                        buttons: {
                                            "Merge": function () {
                                                var dialogbox = $(this);
                                                $.getJSON('/ACES/MergeVehicles', { targetID: existsdata, currentID: vID }, function (response) {
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
                                                    $(dialogbox).dialog("close");
                                                });
                                            },
                                            "Cancel": function () {
                                                $(this).dialog("close");
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            showMessage('No attributes selected');
                        }
                    },
                    "Close": function () {
                        $(this).dialog("close");
                    }
                }
            });
        });
    });

    $('#find').on('click', function () {
        getCurtDevVehicles();
        getVCDBVehicles();
    });

    $(document).on('click', 'input.addedAttrib', function (e) {
        var rowid = $(this).parent().parent().attr('id');
        var cboxes = $('input.addedAttrib');
        if (cboxes.is(':checked')) {
            $('input.addedAttrib').attr('disabled', 'disabled');
            $(this).removeAttr('disabled');
        } else {
            $('input.addedAttrib').removeAttr('disabled', 'disabled');
        }
    });

    $(document).on('click', 'a.parts,a.gear', function (e) {
        var vid = $(this).data('vid');
        var bvid = $(this).data('bvid');
        var submodelID = $(this).data('submodelid');
        if (vid == undefined) {
            vid = 0;
        }
        if (bvid == undefined) {
            bvid = 0;
        }
        if (submodelID == undefined) {
            submodelID = 0;
        }
        $.getJSON('/ACES/GetVehicleParts', { vehicleID: vid, baseVehicleID: bvid, submodelID: submodelID }, function (data) {
            $("#config-dialog").empty();
            var partmsg = '<ul id="vehiclePartList">';
            $(data).each(function (i, vpart) {
                partmsg += '<li><a target="_blank" href="/Product/EditACESVehicles?partID=' + vpart.PartNumber + '">' + vpart.PartNumber + '</a><a href="#" class="viewNotes" data-id="' + vpart.ID + '">Notes</a> <a class="removePart" href="/ACES/RemoveVehiclePart/' + vpart.ID + '">&times;</a>';
            });
            partmsg += '</ul>';
            if (data.length == 0) {
                partmsg += '<p id="noparts">No Parts Associated</p>';
            }
            partmsg += '<label for="addPart">Add Part<br /><input type="text" id="addPart" data-vid="' + vid + '" data-submodelid="' + submodelID + '" data-bvid="' + bvid + '" placeholder="Enter a part number" /></label>';
            partmsg += '<button id="submitPart">Add</button>';
            $("#config-dialog").append(partmsg);
            $("#config-dialog").dialog({
                modal: true,
                title: "Vehicle Parts",
                width: 'auto',
                height: 'auto',
                buttons: {
                    "Populate": function () {
                        $.getJSON('/ACES/PopulatePartsFromBaseVehicle', { vehicleID: vid, baseVehicleID: bvid, submodelID: submodelID }, function (partdata) {
                            if (partdata.length > 0) {
                                $('#noparts').remove();
                                var partmsg = "";
                                $(partdata).each(function (i, vpart) {
                                    partmsg += '<li><a target="_blank" href="/Product/EditACESVehicles?partID=' + vpart.PartNumber + '">' + vpart.PartNumber + '</a><a href="#" class="viewNotes" data-id="' + vpart.ID + '">Notes</a> <a class="removePart" href="/ACES/RemoveVehiclePart/' + vpart.ID + '">&times;</a>';
                                });
                                $('#vehiclePartList').empty();
                                $('#vehiclePartList').append(partmsg);
                            }
                        });
                    },
                    "Done": function () {
                        $(this).dialog("close");
                    }
                }
            });
        });
    });

    $(document).on('click', '.removePart', function (e) {
        e.preventDefault();
        var href = $(this).attr('href');
        var liobj = $(this).parent();
        if (confirm('Are you sure you want to remove this part from this vehicle?')) {
            $.post(href, function (data) {
                if (data) {
                    $(liobj).fadeOut('400', function () {
                        $(liobj).remove();
                        if ($('#vehiclePartList li').length == 0) {
                            $('#vehiclePartList').after('<p id="noparts">No Parts Associated</p>');
                        }
                    });
                }
            }, "json");
        }
    });

    $(document).on('click', '.removeNote', function (e) {
        e.preventDefault();
        var href = $(this).attr('href');
        var liobj = $(this).parent();
        $.post(href, function (data) {
            if (data) {
                $(liobj).fadeOut('400', function () {
                    $(liobj).remove();
                    if ($('#notelist li').length == 0) {
                        $('#notelist').after('<p id="nonotes">No Notes</p>');
                    }
                });
            }
        }, "json");
    });

    $(document).on('click', '#submitPart', function (e) {
        e.preventDefault();
        var bobj = $(this);
        var partID = $('#addPart').val().trim();
        if (partID != "") {
            var vid = $('#addPart').data('vid');
            var bvid = $('#addPart').data('bvid');
            var submodelid = $('#addPart').data('submodelid');
            $.getJSON('/ACES/AddVehiclePart', { vehicleID: vid, baseVehicleID: bvid, submodelID: submodelid, partID: partID }, function (data) {
                $('#noparts').remove();
                $('#vehiclePartList').empty();
                var partmsg = "";
                var vpid = 0;
                $(data).each(function (i, vpart) {
                    partmsg += '<li><a target="_blank" href="/Product/EditACESVehicles?partID=' + vpart.PartNumber + '">' + vpart.PartNumber + '</a><a href="#" class="viewNotes" data-id="' + vpart.ID + '">Notes</a><a class="removePart" href="/ACES/RemoveVehiclePart/' + vpart.ID + '">&times;</a>';
                    if (vpart.PartNumber == partID) {
                        vpid = vpart.ID;
                    }
                });
                $('#vehiclePartList').append(partmsg);
                $('#addPart').attr('value', '');
                loadNotes(vpid);
            });
        } else {
            $('#addPart').attr('value','');
            showMessage("You must enter a part ID.");
        }
    });

    $(document).on('click', 'a.viewNotes', function (e) {
        e.preventDefault();
        var vpid = $(this).data('id');
        loadNotes(vpid);
    });

    $(document).on('click', '#submitNote', function (e) {
        e.preventDefault();
        var notetext = $('#addNote').val().trim();
        if (notetext != "") {
            var vpid = $('#addNote').data('vpid');
            $.getJSON('/ACES/AddNote', { vPartID: vpid, note: notetext }, function (data) {
                var notemsg = "";
                $(data).each(function (i, note) {
                    notemsg += '<li>' + note.note1 + '<a href="/ACES/RemoveNote/' + note.ID + '" class="removeNote">&times;</a></li>';
                });
                $('#notelist').empty();
                $('#notelist').append(notemsg);
                $('#nonotes').remove();
                $('#addNote').attr('value', '');
            });
        } else {
            $('#addNote').attr('value', '');
            showMessage("You must enter a note.");
        }
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
    var partid = ($('#partID').val() != undefined) ? $('#partID').val() : 0;
    var showAdd = ($('#showAdd').val() != undefined && $('#showAdd').val() == 'true') ? true : false;
    if (makeid == "" || modelid == "") return;
    $('#curtDevData').empty();
    $('#loadingCurtDev').show();
    $.getJSON('/ACES/GetVehicles', { makeid: makeid, modelid: modelid, partid: partid }, function (vData) {
        //console.log(vData);
        $('#loadingCurtDev').hide();
        if (vData.length > 0) {
            $(vData).each(function (y, BaseVehicle) {
                var hasPart = (BaseVehicle.vehiclePart != null) ? true : false;
                var opt = '<li id="bv-' + BaseVehicle.ID + '">' + BaseVehicle.YearID + ' ' + BaseVehicle.Make.MakeName + ' ' + BaseVehicle.Model.ModelName + ((BaseVehicle.AAIABaseVehicleID == null) ? '<span class="notvcdb">&times</span>' : '<span class="vcdb">&#10004</span>') + '<span class="tools">' + ((showAdd && !hasPart) ? '<a href="/ACES/AddVehiclePart?partID=' + partid + '&baseVehicleID=' + BaseVehicle.ID + '&partOrVehicle=part" class="addToPart leftarrow" title="Add vehicle part relationship"></a>' : '') + '<a href="#" class="gear" data-bvid="' + BaseVehicle.ID + '" title="View Parts"></a><a class="remove" href="/ACES/RemoveBaseVehicle/' + BaseVehicle.ID + '" title="Remove Base Vehicle">&times;</a></span><ul class="submodels">';
                $(BaseVehicle.Submodels).each(function (i, submodel) {
                    var hasPart = (submodel.vehiclePart != null) ? true : false;
                    opt += '<li id="bv' + BaseVehicle.ID + 's' + submodel.SubmodelID + '">' + submodel.submodel.SubmodelName.trim() + ((submodel.vcdb) ? '<span class="vcdb">&#10004</span>' : '<span class="notvcdb">&times</span>') + '<span class="tools">';
                    if (showAdd && !hasPart) {
                        opt += '<a href="/ACES/AddVehiclePart?partID=' + partid + '&baseVehicleID=' + BaseVehicle.ID + '&submodelID=' + submodel.SubmodelID + '&partOrVehicle=part" title="Add vehicle part relationship" class="addToPart leftarrow"></a>';
                    }
                    opt += '<a href="/ACES/RemoveSubmodel?BaseVehicleID=' + BaseVehicle.ID + '&SubmodelID=' + submodel.SubmodelID + '" class="removesubmodel" title="Remove Submodel Vehicle">&times;</a>';
                    opt += '<a href="/ACES/AddConfig?BaseVehicleID=' + BaseVehicle.ID + '&SubmodelID=' + submodel.SubmodelID + '" data-bvid="' + BaseVehicle.ID + '" data-submodelID="' + submodel.SubmodelID + '"  class="addconfig" title="Add Configuration">+</a>';
                    opt += ' <a href="#" class="gear" data-bvid="' + BaseVehicle.ID + '" data-submodelID="' + submodel.SubmodelID + '" title="View Parts"></a><a href="#" class="showConfig" title="Show / Hide Configurations">';
                    opt += '<span class="vehicleCount">' + submodel.vehicles.length + '</span><span class="arrow"></span>';
                    opt += '</a>';
                    opt += '</span><span class="clear"></span>';
                    opt += generateConfigTable(submodel);
                });
                opt += '</ul></li>';
                $('#curtDevData').append(opt);
            });
        } else {
            $('#curtDevData').append('<p>No Vehicles</p>');
        }
    });
};

getVCDBVehicles = function () {
    var makeid = $('#make').val();
    var modelid = $('#model').val();
    if (makeid == "" || modelid == "") return;
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
                    opt += ' <a href="#" class="showConfig" title="Show / Hide Configurations"><span class="arrow"></span></a>';
                    opt += '</span><span class="clear"></span>';
                    opt += '<div class="configs"><ul>';
                    if (vehicle.BodyStyleConfigs.length > 0) {
                        opt += "<li><strong>Body:</strong> ";
                        $(vehicle.BodyStyleConfigs).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.BodyStyleConfig.BodyNumDoor.BodyNumDoors) + "-door " + $.trim(config.BodyStyleConfig.BodyType.BodyTypeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.BedConfigs.length > 0) {
                        opt += "<li><strong>Bed:</strong> ";
                        $(vehicle.BedConfigs).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.BedConfig.BedLength.BedLength1) + " inch " + $.trim(config.BedConfig.BedType.BedTypeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.BrakeConfigs.length > 0) {
                        opt += "<li><strong>Brakes:</strong> ";
                        $(vehicle.BrakeConfigs).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.BrakeConfig.BrakeSystem.BrakeSystemName) + " " + $.trim(config.BrakeConfig.BrakeAB.BrakeABSName) + " Front " + $.trim(config.BrakeConfig.FrontBrakeType.BrakeTypeName) + " Rear " + $.trim(config.BrakeConfig.RearBrakeType.BrakeTypeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.DriveTypes.length > 0) {
                        opt += "<li><strong>Drive:</strong> ";
                        $(vehicle.DriveTypes).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.DriveType.DriveTypeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.EngineConfigs.length > 0) {
                        opt += "<li><strong>Engine:</strong> ";
                        $(vehicle.EngineConfigs).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.EngineConfig.EngineBase.Liter) + "L " + $.trim(config.EngineConfig.EngineBase.BlockType) + $.trim(config.EngineConfig.EngineBase.Cylinders) + " " + $.trim(config.EngineConfig.Valve.ValvesPerEngine) + "V " + $.trim(config.EngineConfig.EngineVersion.EngineVersion1);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.MfrBodyCodes.length > 0) {
                        opt += "<li><strong>Mfr Body Codes:</strong> ";
                        $(vehicle.MfrBodyCodes).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.MfrBodyCode.MfrBodyCodeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.SpringTypeConfigs.length > 0) {
                        opt += "<li><strong>Springs:</strong> ";
                        $(vehicle.SpringTypeConfigs).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += "Front " + $.trim(config.SpringTypeConfig.FrontSpringType.SpringTypeName) + " Rear " + $.trim(config.SpringTypeConfig.RearSpringType.SpringTypeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.SteeringConfigs.length > 0) {
                        opt += "<li><strong>Steering:</strong> ";
                        $(vehicle.SteeringConfigs).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.SteeringConfig.SteeringSystem.SteeringSystemName) + " " + $.trim(config.SteeringConfig.SteeringType.SteeringTypeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.Transmissions.length > 0) {
                        opt += "<li><strong>Transmission:</strong> ";
                        $(vehicle.Transmissions).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.Transmission.TransmissionBase.TransmissionNumSpeed.TransmissionNumSpeeds) + "sp " + $.trim(config.Transmission.TransmissionBase.TransmissionControlType.TransmissionControlTypeName);
                        });
                        opt += "</li>";
                    }
                    if (vehicle.Wheelbases.length > 0) {
                        opt += "<li><strong>Wheelbase:</strong> ";
                        $(vehicle.Wheelbases).each(function (z, config) {
                            if (z != 0) {
                                opt += ", ";
                            }
                            opt += $.trim(config.WheelBase.WheelBase1) + " inches";
                        });
                        opt += "</li>";
                    }
                    opt += '</ul></div>'
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
    var showAdd = ($('#showAdd').val() != undefined && $('#showAdd').val() == 'true') ? true : false;
    var partid = ($('#partID').val() != undefined) ? $('#partID').val() : 0;
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
        var hasPart = (vehicle.vehiclePart != null) ? true : false;
        configTable += '<tr>';
        configTable += '<td>' + ((vehicle.vcdb) ? '<span class="vcdb">&#10004</span>' : '<span class="notvcdb">&times</span>') + '</td>';
        $(submodel.configlist).each(function (z, config) {
            configTable += '<td>';
            $(vehicle.configs).each(function (q, attr) {
                if (attr.ConfigAttributeType.name == config.name) {
                    configTable += attr.value + '<a href="/ACES/RemoveConfigAttribute?vehicleID=' + vehicle.ID + '&attrID=' + attr.ID + '" data-vehicleID="' + vehicle.ID + '" data-attrID="' + attr.ID + '" class="removeattribute">&times;</a>';
                }
            });
            configTable += '</td>';
        });
        configTable += '<td>' + ((showAdd && !hasPart) ? '<a href="/ACES/AddVehiclePart?partID=' + partid + '&vehicleID=' + vehicle.ID + '&partOrVehicle=part" class="addToPart" title="Add vehicle part relationship">Add to Part</a> | ' : '') + '<a href="#" class="change" data-id="' + vehicle.ID + '" title="Add new attributes">Change</a> | <a href="#" class="custom" data-id="' + vehicle.ID + '" title="Custom Configuration">Custom</a> | <a href="#" class="parts" data-vid="' + vehicle.ID + '" title="View Parts">Parts</a> | <a href="/ACES/removeVehicle/' + vehicle.ID + '" data-id="' + vehicle.ID + '" class="removeconfig" title="Remove Configuration">&times;</a></td></tr>'
    });
    configTable += '</tbody></table></div>';
    return configTable;
};

generateVehicleConfigs = function (data,vID) {
    $("#config-dialog").empty();
    if (data == null || (data.BodyStyles.length == 0 && data.WheelBases.length == 0 && data.MfrBodyCodes.length == 0
                && data.DriveTypes.length == 0 && data.Beds.length == 0 && data.Steering.length == 0 && data.Springs.length == 0
                && data.Brakes.length == 0 && data.Engines.length == 0 && data.Transmissions.length == 0)) {
        $("#config-dialog").append("<p>There are no configurations for this vehicle in the VCDB</p>");
    } else {
        var configcount = 0;
        var configtable = '<div class="configs" style="display:block;" data-vid="' + vID + '">';
        if (data.BodyStyles.length > 1) {
            if (data.BodyStyles.length > configcount) {
                configcount = data.BodyStyles.length;
            }
            configtable += '<div class="configtable"><p>Body Styles</p><table><thead>'
            var tabletop = '';
            $(data.BodyStyles[0].types).each(function(i,type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.BodyStyles).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.WheelBases.length > 1) {
            if (data.WheelBases.length > configcount) {
                configcount = data.WheelBases.length;
            }
            configtable += '<div class="configtable"><p>Wheel Base</p><table><thead>'
            var tabletop = '';
            $(data.WheelBases[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.WheelBases).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.MfrBodyCodes.length > 1) {
            if (data.MfrBodyCodes.length > configcount) {
                configcount = data.MfrBodyCodes.length;
            }
            configtable += '<div class="configtable"><p>Mfr Body Codes</p><table><thead>'
            var tabletop = '';
            $(data.MfrBodyCodes[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.MfrBodyCodes).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.DriveTypes.length > 1) {
            if (data.DriveTypes.length > configcount) {
                configcount = data.DriveTypes.length;
            }
            configtable += '<div class="configtable"><p>Drive Types</p><table><thead>'
            var tabletop = '';
            $(data.DriveTypes[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.DriveTypes).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.Beds.length > 1) {
            if (data.Beds.length > configcount) {
                configcount = data.Beds.length;
            }
            configtable += '<div class="configtable"><p>Bed</p><table><thead>'
            var tabletop = '';
            $(data.Beds[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.Beds).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.Steering.length > 1) {
            if (data.Steering.length > configcount) {
                configcount = data.Steering.length;
            }
            configtable += '<div class="configtable"><p>Steering</p><table><thead>'
            var tabletop = '';
            $(data.Steering[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.Steering).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.Springs.length > 1) {
            if (data.Springs.length > configcount) {
                configcount = data.Springs.length;
            }
            configtable += '<div class="configtable"><p>Springs</p><table><thead>'
            var tabletop = '';
            $(data.Springs[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.Springs).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }

        if (data.Brakes.length > 1) {
            if (data.Brakes.length > configcount) {
                configcount = data.Brakes.length;
            }
            configtable += '<div class="configtable"><p>Brakes</p><table><thead>'
            var tabletop = '';
            $(data.Brakes[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.Brakes).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.Engines.length > 1) {
            if (data.Engines.length > configcount) {
                configcount = data.Engines.length;
            }
            configtable += '<div class="configtable"><p>Engines</p><table><thead>'
            var tabletop = '';
            $(data.Engines[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.Engines).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        if (data.Transmissions.length > 1) {
            if (data.Transmissions.length > configcount) {
                configcount = data.Transmissions.length;
            }
            configtable += '<div class="configtable"><p>Transmissions</p><table><thead>'
            var tabletop = '';
            $(data.Transmissions[0].types).each(function (i, type) {
                tabletop += '<th>' + type.name + '</th>';
            });
            configtable += '<tr>' + tabletop + '</tr></thead><tbody>';
            $(data.Transmissions).each(function (i, config) {
                configtable += '<tr>'
                $(config.attributes).each(function (i, attr) {
                    configtable += '<td class="configattr"><input type="checkbox" class="addedAttrib" id="attrib-' + attr.vcdbID + attr.ConfigAttributeTypeID + '" data-id="' + attr.vcdbID + '" data-typeid="' + attr.ConfigAttributeTypeID + '" data-value="' + attr.value + '" /> ' + attr.value + '</td>';
                });
                configtable += '</tr>';
            });
            configtable += '</tbody></table></div>';
        }
        configtable += '</div>';
        if (configcount < 2) {
            configtable = '<p>There is only one configuration for this vehicle.</p>'
        }
    }
    $("#config-dialog").append(configtable);
};

loadNotes = function (vPartID) {
    $("#notes-dialog").empty();
    $.getJSON('/ACES/GetNotes/' + vPartID, function (data) {
        var notemsg = '<ul id="notelist">';
        $(data).each(function (i, note) {
            notemsg += '<li>' + note.note1 + '<a href="/ACES/RemoveNote/' + note.ID + '" class="removeNote">&times;</a></li>';
        });
        notemsg += '</ul>';
        if (data.length == 0) {
            notemsg += '<p id="nonotes">No Notes</p>';
        }
        notemsg += '<label for="addNote">Add Note<br /><input type="text" id="addNote" data-vpid="' + vPartID + '" placeholder="Enter a note" /></label>';
        notemsg += '<button id="submitNote">Add</button>';
        $("#notes-dialog").append(notemsg);
        $('#addNote').autocomplete({
            minLength: 1,
            source: function (request, response) {
                $.getJSON('/ACES/SearchNotes', { keyword: $('#addNote').val() }, function (data) {
                    response($.map(data, function (item) {
                        return {
                            label: item.label,
                            value: item.value,
                            id: item.ID
                        }
                    }));
                })
            },
            open: function () {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close: function () {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
            },
            select: function (e, ui) {
                e.preventDefault();
                $('#addNote').val(ui.item.value);
            }
        });
        $("#notes-dialog").dialog({
            modal: true,
            title: "Vehicle Part Notes",
            width: 'auto',
            height: 'auto',
            buttons: {
                "Done": function () {
                    $(this).dialog("close");
                    $('#addPart').focus();
                }
            }
        });
    });
}