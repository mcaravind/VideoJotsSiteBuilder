/**
 * Created by aravindmc on 3/21/2016.
 */
var fs = require('fs'),
    path = require('path');
var gui = require('nw.gui');


function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function (file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

function loadFiles(srcPath) {
    var EventEmitter = require('events').EventEmitter;
    var filesEE = new EventEmitter();
    var myfiles = [];

    // this event will be called when all files have been added to myfiles
    filesEE.on('files_ready', function () {
        //do something with the list of files in the myfiles array
        //fetch the description from youtube based on filename
        //construct suitable directory from directory name
        //construct suitable html for directory page
        //construct html for individual pages
        //save to destination folder

        var sHtml = '';
        var brTag = $('<br/>');
        var clearFix = $('<div/>', {
            'class':'clearfix visible-lg'
        });
        var tableEl = $('<table/>', {
            class: 'table table-striped'
        });
        var tr = $('<tr/>', {});
        tableEl.append(tr);
        $.each(myfiles, function (index, value) {
            var dirName = getDirectoryFromFileName(value);
            var td = $('<td/>', {});
            var imageFileNameWithoutPath = getImageFileName(value);
            var scoreFileName = value.replace('file_', 'score_');
            var originalFileName = getOriginalFileName(value);
            var imageFileName = path.join('data', dirName, imageFileNameWithoutPath);

            var obj = JSON.parse(fs.readFileSync(getFullPath(scoreFileName), 'utf-8'));
            var scores = obj.scores;
            var dayArray = [];
            $.each(scores, function (index, item) {
                //incomplete attempts do not count
                if (item.totalSeconds) {
                    var lastDateModified = (new Date(item.lastModified)).setHours(0,0,0,0);
                    var now = new Date();
                    var timeDiff = Math.abs(now.setHours(0,0,0,0) - lastDateModified);
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    dayArray.push(diffDays);
                }
            });
            var divFileName = $('<div/>', {
                html: '<b>' + originalFileName + '</b>'
            });
            $(divFileName).css('text-align', 'center');
            $(divFileName).css('width', '300px');

            var divRecentActivity = $('<div/>', {
                html: 'Last 30 days:<br/>'
            });
            $(divRecentActivity).css('text-align', 'center');
            $(divRecentActivity).css('width', '300px');

            var recentActivityTable = $('<table></table>');
            $(recentActivityTable).css('width', '300px');
            $(recentActivityTable).css('border', '1px solid black');
            $(recentActivityTable).css('border-collapse', 'collapse');
            for (i = 0; i < 2; i++) {
                var row = $('<tr></tr>');
                for (j = 0; j < 15; j++) {
                    var cell = $('<td></td>');
                    var sDate = new Date();
                    sDate.setDate(sDate.getDate() - ((15 * i) + j));
                    $(cell).html(sDate.getDate().toString());
                    $(cell).css('width', '6%');
                    $(cell).attr('align', 'center');
                    if ($.inArray(((15 * i) + j), dayArray) > -1) {
                        $(cell).css('background-color', 'cadetblue');
                    }
                    $(cell).css('height', '20px');
                    $(cell).css('border', '1px solid black');
                    $(cell).css('border-collapse', 'collapse');
                    row.append(cell);
                }
                recentActivityTable.append(row);
            }

            var divThumb = $('<div/>', {
                "class": 'col-lg-4'
            });

            var aThumb = $('<a/>', {
                "class":"thumbnail"
            });
            $(aThumb).css('width', '300px');
            var imgThumb = $('<img/>', {
                class: 'img-responsive',
                src:imageFileName
            });
            aThumb.append(imgThumb);

            var divTag = $('<div/>', {
            });
            $(divTag).css('width', '300px');
            $(divTag).css('text-align', 'center');
            var atagEdit = $('<a/>', {
                href: "add.html?file=" + value
            });
            var spantagEdit = $('<span/>', {
                html:'Edit'
            });
            atagEdit.append(spantagEdit);

            var atagScores = $('<a/>', {
                href:"scores.html?file="+scoreFileName
            });
            var spantagScores = $('<span/>', {
                html:'Scores'
            });
            atagScores.append(spantagScores);

            var atagReview = $('<a/>', {
                href: "review.html?file=" + value
            });
            var spanTagReview = $('<span/>', {
                html: 'Review'
            });
            atagReview.append(spanTagReview);

            var buttonDelete = $('<button/>', {
                text: 'Delete',
                class: 'btn btn-primary btn-xs',
                id: value
            });
            divTag.append(" ");
            divTag.append(atagEdit);
            divTag.append("  ");
            divTag.append(atagReview);
            divTag.append("  ");
            divTag.append(atagScores);
            divTag.append("  ");
            divTag.append(buttonDelete);
            divTag.append(brTag);
            divThumb.append(divTag);
            divThumb.append(aThumb);
            divThumb.append(divFileName);
            divThumb.append(divRecentActivity);
            divThumb.append(recentActivityTable);
            td.append(divThumb);
            tr.append(td);
            if ((index + 1) % 3 === 0) {
                tr = $('<tr/>', {});
                tableEl.append(tr);
            }
            $(buttonDelete).confirmation({
                onConfirm:function(button) {
                    deleteMap($(buttonDelete).attr("id"));
                    $(buttonDelete).confirmation('hide');
                },
                onCancel:function(button) {
                    $(buttonDelete).confirmation('hide');
                }
            });
        });
        $("#fileList").append(tableEl);
    });

    var allDirectories = getDirectories(srcPath);
    var dirCount = allDirectories.length;
    var count = 0;
    allDirectories.forEach(function(value) {
        // read all files from current directory
        var directory =value;
        fs.readdir(directory, function (err, files) {
            if (err) throw err;
            files.forEach(function (file) {
                if (file.substr(-4) === '.txt' ) {
                    myfiles.push(file);
                }
            });
            count += 1;
            if(count === dirCount)
                filesEE.emit('files_ready');// trigger files_ready event
        });
    });
}