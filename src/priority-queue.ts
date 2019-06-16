'use strict';

export class PriorityQueue<T>
{
    length: number;
    compare: any;

    constructor(private data: Array<T>, compare)
    {
        this.data = data || [];
        this.length = this.data.length;
        this.compare = compare || PriorityQueue.defaultCompare;

        if (data != null)
        {
            for (let i = Math.floor(this.length / 2); i >= 0; i--)
            {
                this._down(i);
            }
        }
    }

    push(item: T)
    {
        this.data.push(item);
        this.length++;
        this._up(this.length - 1);
    }

    pop()
    {
        let top: T = this.data[0];
        this.data[0] = this.data[this.length - 1];
        this.length--;
        this.data.pop();
        this._down(0);
        return top;
    }

    peek()
    {
        return this.data[0];
    }

    get(index: number)
    {
        return this.data[index];
    }

    _up(pos)
    {
        let data = this.data;
        let compare = this.compare;

        while (pos > 0)
        {
            let parent = Math.floor((pos - 1) / 2);
            if (compare(data[pos], data[parent]) < 0)
            {
                PriorityQueue.swap(data, parent, pos);
                pos = parent;

            } else break;
        }
    }

    _down(pos)
    {
        let data = this.data,
            compare = this.compare,
            len = this.length;

        while (true)
        {
            let left = 2 * pos + 1,
                right = left + 1,
                min = pos;

            if (left < len && compare(data[left], data[min]) < 0) min = left;
            if (right < len && compare(data[right], data[min]) < 0) min = right;

            if (min === pos) return;

            PriorityQueue.swap(data, min, pos);
            pos = min;
        }
    }

    private static defaultCompare(a, b)
    {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    private static swap(data, i, j)
    {
        let tmp = data[i];
        data[i] = data[j];
        data[j] = tmp;
    }
}






