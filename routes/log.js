


app.use('/log', (req, res) => {
    let logs = req.body;
    console.log('logs',logs);
    if (typeof logs === 'string') {
        try {
            logs = JSON.parse(logs);
            res.send(logs); 
        } catch (err) {
            logs = null;
        }
    }

    // 如果日志是一个数组，说明是正常的数据
    if (Array.isArray(logs)) {
       
        logs.forEach(log => {
            var time = log.time;
            var level = log.level;
           // const msgs = JSON.stringify(log.messages);
           var msgs = JSON.stringify(log.messages);
           var uid=log.messages[0];
           var url = log.url;
           var userAgent = log.agent;
           var color = colorize(level);
            console[level](`${color.start}[${time}] [${level.toUpperCase()}] [${url}] -${color.end}`, ...msgs, `用户代理: ${userAgent}`);
            //发送到数据库  
            //截取域名判断
            var hostname=URL.parse(url,false,true).hostname;
            console.log('hostname',hostname);
             //根据域名插入不同的记录表
            switch(hostname)
            {
                case "tms.sowl.cn":
                      //tms
                    var hostvalid=true;
                    pool.getConnection((err, conn)=>{
                        if(err){
                            return;
                        }
                        conn.query('INSERT INTO tms_log_total VALUES(NULL,?,?,?,?,?,?)',
                            [level,time,uid,url,userAgent,msgs], (err, result)=>{ 
                                if(err){
                                    return;
                                }  
                            conn.release();
                        })
                    })
                    break;
                case "csp.sowl.cn":
                     //csp
                     var hostvalid=true;
                    pool.getConnection((err, conn)=>{
                        if(err){
                            return;
                        }
                        conn.query('INSERT INTO csp_log_total VALUES(NULL,?,?,?,?,?,?)',
                            [level,time,uid,url,userAgent,msgs], (err, result)=>{ 
                                if(err){
                                    return;
                                }  
                            conn.release();
                        })
                    })
                    break;
                case "ccp.sowl.cn":
                    //ccp
                    var hostvalid=true;
                    pool.getConnection((err, conn)=>{
                        if(err){
                            return;
                        }
                        conn.query('INSERT INTO ccp_log_total VALUES(NULL,?,?,?,?,?,?)',
                            [level,time,uid,url,userAgent,msgs], (err, result)=>{ 
                                if(err){
                                    return;
                                }  
                            conn.release();
                        })
                    })
                    console.log("ccp");
                    break;       
                default:
                var hostvalid=false;
                console.log('域名不匹配');
            }

            //error日志报警
            var list={
                level:level,
                hostname:hostname,
                time:time,
                url:url,
                msgs:msgs
            }
            if(hostvalid){
                sendEmail(list);
            }
        });
    }

    // 仅返回一个空字符串，节省带宽
    res.end('');
    // }
});