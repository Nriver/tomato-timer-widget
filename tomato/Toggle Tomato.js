// 这个脚本可以快速切换番茄时钟的显示/隐藏
// 建议将其设置为工具栏按钮或快捷键

async function toggleTomatoVisibility() {
    // 获取当前状态
    const isHidden = localStorage.getItem('tomatoVisible') === 'false';
    
    // 切换状态
    if (isHidden) {
        localStorage.setItem('tomatoVisible', 'true');
        api.showMessage('🍅 番茄时钟已显示', 2000);
    } else {
        localStorage.setItem('tomatoVisible', 'false');
        api.showMessage('🍅 番茄时钟已隐藏', 2000);
    }
    
    // 查找 tomato 按钮并触发点击
    const showButton = document.getElementById('showButton');
    const hideButton = document.getElementById('hideButton');
    
    if (isHidden && showButton) {
        // 隐藏状态，现在要显示，点击 show 按钮
        showButton.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        api.triggerCommand('reloadFrontend');
    } else if (!isHidden && hideButton) {
        // 显示状态，现在要隐藏，点击 hide 按钮
        hideButton.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        api.triggerCommand('reloadFrontend');
    }
}

await toggleTomatoVisibility();