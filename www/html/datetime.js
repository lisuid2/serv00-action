function getTime() {
            var date = new Date();
            //console.log(date);
            var hour = date.getHours(); //获取小时
            hour = hour < 10 ? '0' + hour : hour;
            var minute = date.getMinutes(); // 获取分
            minute = minute < 10 ? '0' + minute : minute;
            var seconds = date.getSeconds(); //获取秒
            seconds = seconds < 10 ? '0' + seconds : seconds;
            time = hour + ':' + minute + ':' + seconds;
            return time;
        }
function getDate() {
            var date = new Date();
            //console.log(date);
            var year = date.getFullYear(); //获取年份
            var month = date.getMonth() + 1; //获取月份
            var day = date.getDate(); //获取日期
            date = year + '年' + month + '月' + day + '日';
            return date;
        }