import {RichTextEditor} from "./editor";

export class RTParagraph
{
	private editor: RichTextEditor;
	id: string;
	text: string;
	// private styles: any[];
	// private meta: any[];
	// private layout: {};

	constructor(editor: RichTextEditor, text: string = '')
	{
		this.editor = editor;
		this.id = 'rtp_'+Math.random().toString(36).substr(2, 9);
		this.text = text;
		// this.styles = [];
		// this.meta = [];
		// this.layout = {};
	}

	addText(add: string, start: number, end: number)
	{
		// console.log('addText',{
		// 	cur:this.text,
		// 	start,
		// 	end,
		// 	add
		// });
		if (start > end)
		{
			let swap = start;
			start = end;
			end = swap;
		}
		this.text = this.text.slice(0, start) + add + this.text.slice(end);
		// console.log('result', this.text);
		this.editor.selection.moveOffset(add.length);
	}

	removeText(start: number, end: number)
	{
		/*console.log('removeText',{
			cur:this.text,
			start,
			end
		});*/
		if (start > end)
		{
			let swap = start;
			start = end;
			end = swap;
		}
		this.text = this.text.slice(0, start) + this.text.slice(end);
		this.editor.selection.moveOffset(start - end);
	}

	html()
	{
		return `<div id="${this.id}" class="rt-paragraph">${this.text}</div>`;
	}

	getNode(offset: number): Node
	{
		let node = document.getElementById(this.id) as HTMLElement;
		if (node.firstChild)
			return node.firstChild;
		return node;
	}

	split(index: number)
	{
		return [new RTParagraph(this.editor, this.text.slice(0, index)), new RTParagraph(this.editor, this.text.slice(index))];
	}
}