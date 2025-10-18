

This is my first impression on your technology and I am going to be honest, it was a bit hard to start with your Battleship template. 
https://github.com/calimero-network/battleships

A lot of commands to execute without understanding the real logic, maybe this has to be followed from a video? Nevertheless, I think you should leverage this template and explain your technology, how it is working, what the interactions are, where is deployed the wasm program? 
Personally, needed some time to understand that you could have two different nodes running at the same time and sharing the same data.
It was not clear in my head, but maybe I should have started from another tutorial or endoint. I just have the feeling that this starter is for someone who already understands the different components and the technology. Not for the total beginner. 

Also, notice that I tried to run steps by steps your demo, but ran into the following issue (https://github.com/calimero-network/battleships/issues/3)

---- 

Note: Maybe it could be good to split your documentation based on the different parties you have. A broader doc to give you an overview of this project and the basic command to run it in a few lines. And then, in each folder `app`, `logic` and `workflow` have more detailed documentation, on what this part is doing, how it integrates. I do not know.

---- 

On the `logic` folder, I am not really familiar with wasm, as it was a long time ago since I did not practice.
But got an issue that I wanted to highlight, as it was not clear for me. Basically, I try to replace the battleship game with the document logic, but when I try to build the ABI, it was completely empty. It seems it was because I needed to define the function definition in the `lib.rs`. The imported one was not working, maybe a specificity of wasm, I do not know. But the script generated me the ABI, with 0 function without an issue haha

Another thing regarding wasm, that I still have not understood yet, is the need to copy the wasm to the data folder. it seems I first need to run the docker, and copy paste the wasm, which can be done using your command as `pnpm run logic:sync ./logic/res/kv_store.wasm`
Notice also that it seems it was missing the right file `./logic/res/kv_store.wasm`. Maybe wrong here, but this is how I am doing it. 
I guess it is useful for the node to have this wasm but do not know why...


----

On the frontend, got some difficulty in understanding the organization, why do you have a `features/kv/api`? Maybe a `utils/kv.ts` is enough?

Would be in favor to simplifying as much as possible all the `index.ts` file. I mean, I am not interested in the design part that you can delegate in some `components` folder, but rather I want to understand how you are interacting with Calimero. Which functions are you using? How should I subscribe easily to events... Which is the core of what I will use for my dapp

Note, seems we should avoid hardcoded value as `url: 'http://node1.127.0.0.1.nip.io',` which is currently the case in the code example. 


----------

Maybe a nice thing would be an quick link to understand the dashboard after you are authenticated with Calimero. Here I still have missing information on the overview vision, application ID, context ID, user authentication...
Which may be explained in your docs, but that I completely missed because I did not know where to search. Maybe add quick links or helpers? Or maybe I completely missed them.


-------

During the development of my project I ran back and forth into bugs, into something that partially works, that something bugs and something that is running successfully. And all of that in the same project version! For your information, I was using the docker version with the `pnpm run network:bootstrap`. I still have not figured out what the potential bugs were here, but I have the feeling that I cannot rely on the docker process.

From my understanding, the issue was that I try to run the dapp on multiple nodes, it creates a first context, BUT depending on my interaction, it can create another context, which leads to two different versions of my dapp. Now I still do not have figured the real bug, but I suspect that one node is modifying one context on the same application ID, while the other node modifying another context, where one modification on one node is not applied on the other.

I also ran into a weird case that I did not succeed to always reproduce. I had two browsers, connected to 2 different nodes. Now, on one browser it was possible to update the text, where the modification was applied on the other browser. However, and here is the catch, when I try to modify on the 2nd browser, the change does not apply on the first one. I still do not know the root cause, but I strongly suspect an issue in the context ID used. Because after cleaning the docker, got the same code working sometimes, which is why I suspect a node configuration issue.

To solve those issues, as mentioned, the only solution for me was to clean all the docker installations, delete the `data` folder and create everything from scratch again and synchronize the wasm file. Note that this does not work all the time. But did not understand why. 

All those points are kind of my experience with Calimero that I learned during the hackathon. I was simply curious and maybe missed a lot of information. Feel free to consider or not this feedback.
