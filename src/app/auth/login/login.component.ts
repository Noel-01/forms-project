import { afterNextRender, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private form = viewChild.required<NgForm>('form'); // este es el form que viene del template y ahora le llamo form en la variable
  private destroyRef = inject(DestroyRef);

  constructor() {

    // * -- cuando el usuario actulice la pagina lo que ha escrito en el email volvera a aparecer en el campo 
    const savedForm = window.localStorage.getItem('saved-login-form');

    if (savedForm) {
      const loadedFormData = JSON.parse(savedForm); // paso el string a objeto
      const savedEmail = loadedFormData.email; // saco el email
      // el setTimout es porque a los valores no le da tiempo a renderizarse y el setValue da un error, asi que le damos un segundo mas
      setTimeout(() => {
        this.form().controls['email'].setValue(savedEmail); // pongo el email en el formulario
      }, 1)
    }
    //-- * //


    // este metodo se ejecuta despues de que se renderice la pagina
    afterNextRender(() => {
      // debounceTime no es necesario, lo unico que hace es guardar el valor cuando el usuario este 500ms sin escribir
      const subscription = this.form().valueChanges?.pipe(debounceTime(500))
      .subscribe({
        //ahora almacenos el valor en local store (lo tienen todos los navegadores) creando un item nuevo con su nombre y valor
        next: (value) => window.localStorage.setItem(
          'saved-login-form', 
          JSON.stringify({email: value.email}))
      });

      this.destroyRef.onDestroy(() => subscription?.unsubscribe());

    });
  }

  // formData es el nombre que le doy yo al form que viene del template html
  onSubmit(formData: NgForm) {

    if (formData.form.invalid) {
        return;
    }

    const enteredEmail = formData.form.value.email;
    const enteredPassword = formData.form.value.password;
    
    console.log(formData.form);
    console.log(enteredEmail, enteredPassword);

    formData.form.reset();
  }
}
