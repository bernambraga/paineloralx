from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from dash.models import Score

@login_required
def about_view(request):
    return render(request, 'about.html')

@login_required
def home_view(request):
    return render(request, 'home.html')

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home_view')  # Redirecione para a página inicial ou qualquer outra
            else:
                messages.error(request, 'Usuário ou senha incorretos.')
        else:
            messages.error(request, 'Usuário ou senha incorretos.')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})



