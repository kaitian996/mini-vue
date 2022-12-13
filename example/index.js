const arr = [1, 8, 5, 3, 4, 9, 7, 6]
//求当前列表中最大递增的个数
//贪心+二分查找
// 1, 8, 5, 3, 4, 9, 7, 6
/**
 * 如果当前比最后一个大，直接插入
 * 如果小，则利用二分查找 找到已经排好的
 */
// 1
// 1 8
// 1 5
// 1 3 4
// 1 3 4 9
// 1 3 4 7
// 1 3 4 6
// 1 2 4 6
function getSquence(arr) {
    const len = arr.length
    const result = [0] //默认保存第0个
    let start
    let end
    let mid
    for (let i = 0; i < len; i++) {
        const arrI = arr[i]
        if (i !== 0) {
            const lastIndex = result[result.length - 1]
            if (arr[lastIndex] < arrI) {
                result.push(i)
                continue
            }
            start = 0
            end = result.length - 1
            while (start < end) { //普通二分算法
                mid = ((start + end) / 2) | 0
                if (arr[result[mid]] < arrI) {
                    start = mid + 1
                } else {
                    end = mid
                }
            }
            if (arrI < arr[result[start]]) {
                result[start] = i
            }
        }
    }
    return result
}
console.log(getSquence(arr))