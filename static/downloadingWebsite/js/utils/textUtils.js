export const text = {
    clipText(text, maxCharacters=16, numberOfCharactersAtStart=10,numberOfCharactersAtEnd=10)
    {
        return new Promise((resolve)=>
        {
            let len = text.length;
            const newName = new Array;
            if(len >maxCharacters)
            {
                for(let i=0;i<len;i++)
                {
                    if(i>=numberOfCharactersAtStart && i<len-numberOfCharactersAtEnd)
                    {
                        if(i<numberOfCharactersAtStart+3)
                        {
                            newName.push('.');
                        }
                        continue;
                    }
                    newName.push(text[i]);
                }
                resolve(newName.join(""));
            }
        resolve(text);
    })
    }
}