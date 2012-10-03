﻿$(function () {
    $('div.controls a').click(function (event) {
        event.preventDefault();
    });

    $('.approve').click(function () {
        var linkobj = $(this)
        var id = $(linkobj).data("id");
        $.post('/Admin_Forum/Approve', { 'id': id }, function (data) {
            $('#post_' + id).fadeOut();
        }, 'text');
    });

    $('.edit').click(function () {
        var id = $(this).data("id");
        $.getJSON('/Admin_Forum/GetPost', { 'postid': id }, function (data) {
            $('#postID').val(data.postID);
            $('#parentid').val(0);
            $('#edit').val(true);
            $('#titlestr').val(data.title);
            $('#post').val(data.post);
            openForm("Edit Post #" + data.postID);
        });
    });

    $('.delete').click(function () {
        var id = $(this).data("id");
        if (confirm("Are you sure you want to remove this post?")) {
            $.post('/Admin_Forum/DeletePost', { 'id': id }, function (data) {
                if (data == "") {
                    $('#post_' + id).fadeOut('fast', function () { $('#post_' + id).remove(); });
                } else {
                    showMessage(data);
                }
            }, "text");
        }
    });

    $('.flag').click(function () {
        var id = $(this).data("id");
        if (confirm("Are you sure you want to mark this post as spam?")) {
            $.post('/Admin_Forum/FlagPost', { 'id': id }, function (data) {
                if (data == "") {
                    $('#post_' + id).fadeOut('fast', function () { $('#post_' + id).remove(); });
                } else {
                    showMessage(data);
                }
            }, "text");
        }
    });

    $('.block').click(function () {
        var id = $(this).data("id");
        var reason = prompt("Enter the reason for blocking this IP", "Spam");
        if (reason != null) {
            $.post('/Admin_Forum/BlockIP', { 'id': id, 'reason': reason }, function (data) {
                if (data == "") {
                    $('#post_' + id).fadeOut('fast', function () { $('#post_' + id).remove(); });
                } else {
                    showMessage(data);
                }
            }, "text");
        }
    });

});