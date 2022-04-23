// (c) 2022 eensander
export function indent(lines: string[], indent = 1, spaces_per = 2): string[] {
    return lines.map(line => ' '.repeat(indent*2).concat(line))
}