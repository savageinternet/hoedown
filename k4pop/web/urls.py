from django.conf.urls import patterns, url

from web import admin, api, views

urlpatterns = patterns('',
    # admin endpoints - these should only be used at the booth
    url(r'^admin/$', admin.home, name='adminHome'),
    url(r'^admin/users/$', admin.listUsers, name='adminListUsers'),
    url(r'^admin/users/(?P<code>[0-9a-f]{64})/$', admin.viewUser, name='adminViewUser'),
    url(r'^admin/users/(?P<code>[0-9a-f]{64})/printCard$', admin.printCard, name='adminPrintCard'),
    url(r'^admin/users/(?P<code>[0-9a-f]{64})/stats$', admin.updateUserStats, name='adminUpdateUserStats'),
    url(r'^admin/users/(?P<code>[0-9a-f]{64})/name$', admin.updateUserName, name='adminUpdateUserName'),
    url(r'^admin/users/(?P<code>[0-9a-f]{64})/photo$', admin.updateUserPhoto, name='adminUpdateUserPhoto'),
    url(r'^admin/facebook/search$', admin.searchFacebook, name='adminSearchFacebook'),
    # API endpoints - currently just for supporting photo uploads
    url(r'^api/users/(?P<code>[0-9a-f]{64})/photoCredentials$', api.photoCredentials, name='apiPhotoCredentials'),
    # non-admin endpoints - these are for players
    url(r'^users/$', views.createUser, name='createUser'),
    url(r'^users/(?P<id>[0-9]*)/persona$', views.completeUserPersona, name='completeUserPersona'),
    url(r'^users/(?P<code>[0-9a-f]{64})/$', views.viewUser, name='viewUser'),
    url(r'^users/(?P<code>[0-9a-f]{64})/checkLogicPuzzle', views.checkLogicPuzzle, name='checkLogicPuzzle'),
    url(r'^users/(?P<code>[0-9a-f]{64})/complete', views.completeTask, name='completeTask'),
    url(r'^users/(?P<code>[0-9a-f]{64})/viewCard$', views.viewUserCard, name='viewUserCard'),
    url(r'^users/(?P<code>[0-9a-f]{64})/unlink$', views.unlinkUser, name='unlinkUser'),
)
