class Node<T>{
    public data : T
    public next : Node<T> | null
    public previous : Node<T> | null
    constructor(value : T)
    {
        this.data = value
        this.next = null
        this.previous = null
    }
}

export default class Queue<T>
{
    public front : Node<T> | null = null
    public rear : Node<T> | null = null

    constructor(data? : T)
    {
        if(data)
            this.front = this.rear = new Node<T>(data)
    }

    public enqueue(data : T) : Queue<T>
    {
        const node = new Node<T>(data);
        if (!this.rear) {
            this.front = this.rear = node;
        } else {
            this.rear.previous = node;
            node.next = this.rear;
            this.rear = node;
        }
        return this;
    }

    public dequeue() : Node<T> | undefined
    {
        if(this.front === null)
        {
            console.log('Nothing left to dequeue!')
            return undefined
        }
        const temp = this.front
        this.front = this.front.previous
        return temp
    }
}