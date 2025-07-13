from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'store/index.html')

def products(request):
    return render(request, 'store/products.html')

def contact(request):
    return render(request, 'store/contact.html')

def faq(request):
    return render(request, 'store/faq.html')