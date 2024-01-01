import fs from "fs";
import readline from "readline";

//コード行の状態
type CodePos = "root" | "block" | "constructor"

//ソースコードのコンパイル後にElevator Sagaの形式に合致するようにコードを変換する。
const writeStream: fs.WriteStream = fs.createWriteStream("./out/my_elevator_saga_solution_converted.js");
const reader = readline.createInterface(fs.createReadStream("./out/my_elevator_saga_solution.js"), writeStream);
writeStream.write("{\n");
let codePos: CodePos = "root";
let bracketCount: number = 0;
reader.addListener("line", (line: string) => {
	const functionStartLine: RegExpMatchArray | null = line.match(/^[\s\t]*(\w+)\(([\w,\s]*)\)\s{$/);
	if(functionStartLine != null && bracketCount == 0) {
		bracketCount = 1;
		if(functionStartLine[1] == "constructor") codePos = "constructor";
		else {
			writeStream.write(`\t${functionStartLine[1]}: function(${functionStartLine[2]}) {\n`);
			codePos = "block";
		}
	}
	else if(codePos != "root") {
		bracketCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
		switch(codePos) {
			case "block":
				if(bracketCount == 0) {
					writeStream.write("\t},\n");
					codePos = "root";
				}
				else writeStream.write(`${line}\n`);
				break;
			case "constructor":
				if(bracketCount == 0) codePos = "root";
				else {
					const memberVariableLine: RegExpMatchArray | null = line.match(/^[\s\t]*this\.(\w+)\s=\s(.+);$/);
					if(memberVariableLine != null) writeStream.write(`\t${memberVariableLine[1]}: ${memberVariableLine[2]},\n`);
				}
				break;
		}
	}
});
reader.addListener("close", () => {
	writeStream.write("}\n");
});