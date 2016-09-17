import { Pipe, PipeTransform } from '@angular/core';
/* pipes are used for display formatting
 * Example:
 *   {{ 2 |  sample:10}}
*/

@Pipe({name: 'sample'})
export class SamplePipe implements 
PipeTransform {
    transform(left: number, right: string): number {
        //do stuff
        return ;
  }
}
