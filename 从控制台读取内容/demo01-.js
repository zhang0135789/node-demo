const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
// 监听键入回车事件
rl.on('line', (str) => {
    // str即为输入的内容
    if (str === 'close') {
        // 关闭逐行读取流 会触发关闭事件
        rl.close()
    }
    console.log(str);
})

// 监听关闭事件
rl.on('close', () => {
    console.log('触发了关闭事件');
    rl.close()
    process.exit();
})
